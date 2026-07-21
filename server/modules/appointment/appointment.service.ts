import { env } from '../../config/env';
import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { ConflictError } from '../../shared/errors/conflict-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { ValidationError } from '../../shared/errors/validation-error';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import { sanitizePlainText } from '../../shared/utils/sanitize';
import {
  buildDayAvailability,
  isSlotAvailableOnDay,
  zonedDateTimeToUtc,
} from './appointment-availability.util';
import type { IAppointmentSettingsRepository } from './appointment-settings.repository.interface';
import type { IAppointmentRepository } from './appointment.repository.interface';
import type {
  AdminUpdateAppointmentInput,
  Appointment,
  AppointmentListFilter,
  AppointmentSettings,
  AppointmentStatus,
  CreateAppointmentInput,
  DayAvailability,
  UpdateAppointmentSettingsInput,
} from './appointment.types';
import { SLOT_HOLDING_STATUSES } from './appointment.types';

const REMINDER_LEAD_MS = 24 * 60 * 60 * 1000;
const STATUS_EMAIL_STATUSES: readonly AppointmentStatus[] = [
  'confirmed',
  'cancelled',
  'rejected',
  'completed',
  'no_show',
  'rescheduled',
];

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}

function createReferenceCode(date: string): string {
  const compact = date.replaceAll('-', '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SAAN-${compact}-${suffix}`;
}

function resolveTypeLabel(settings: AppointmentSettings, typeId: string): string {
  return settings.appointmentTypes.find((type) => type.id === typeId)?.label ?? typeId;
}

function customerFullName(appointment: Appointment): string {
  return `${appointment.firstName} ${appointment.lastName}`.trim();
}

/** Coordinates appointment booking, availability, settings, and transactional emails. */
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly settingsRepository: IAppointmentSettingsRepository,
    private readonly emailQueue: IEmailQueue,
  ) {}

  getSettings(): Promise<AppointmentSettings> {
    return this.settingsRepository.get();
  }

  async updateSettings(input: UpdateAppointmentSettingsInput): Promise<AppointmentSettings> {
    return this.settingsRepository.update(input);
  }

  async getPublicBookingContext(): Promise<{
    settings: Pick<
      AppointmentSettings,
      | 'workingDays'
      | 'openingTime'
      | 'closingTime'
      | 'slotDurationMinutes'
      | 'bufferMinutes'
      | 'maxAppointmentsPerDay'
      | 'appointmentTypes'
      | 'timezone'
      | 'studioAddressLines'
      | 'contactPhone'
      | 'contactEmail'
      | 'cancellationPolicy'
      | 'guidelines'
      | 'holidays'
      | 'temporaryClosures'
      | 'specialOpeningDays'
    >;
  }> {
    const settings = await this.settingsRepository.get();
    return {
      settings: {
        workingDays: settings.workingDays,
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
        slotDurationMinutes: settings.slotDurationMinutes,
        bufferMinutes: settings.bufferMinutes,
        maxAppointmentsPerDay: settings.maxAppointmentsPerDay,
        appointmentTypes: settings.appointmentTypes.filter((type) => type.isActive),
        timezone: settings.timezone,
        studioAddressLines: settings.studioAddressLines,
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail,
        cancellationPolicy: settings.cancellationPolicy,
        guidelines: settings.guidelines,
        holidays: settings.holidays,
        temporaryClosures: settings.temporaryClosures,
        specialOpeningDays: settings.specialOpeningDays,
      },
    };
  }

  async getAvailability(date: string, now: Date = new Date()): Promise<DayAvailability> {
    const settings = await this.settingsRepository.get();
    const [bookedSlots, bookedCount] = await Promise.all([
      this.appointmentRepository.findBookedSlotsForDate(date),
      this.appointmentRepository.countActiveForDate(date),
    ]);

    return buildDayAvailability({
      settings,
      dateString: date,
      bookedSlots: new Set(bookedSlots.map((slot) => slot.timeSlot)),
      bookedCount,
      now,
    });
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const settings = await this.settingsRepository.get();
    const sanitized = this.sanitizeCreateInput(input);
    await this.assertBookableSlot(settings, sanitized.appointmentDate, sanitized.timeSlot);

    const type = settings.appointmentTypes.find(
      (entry) => entry.id === sanitized.appointmentType && entry.isActive,
    );
    if (!type) {
      throw new ValidationError('Invalid appointment type', [
        { field: 'appointmentType', message: 'Selected appointment type is not available' },
      ]);
    }

    let appointment: Appointment;
    try {
      appointment = await this.appointmentRepository.create({
        ...sanitized,
        referenceCode: createReferenceCode(sanitized.appointmentDate),
        durationMinutes: settings.slotDurationMinutes,
        status: 'pending',
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('This time slot has just been booked. Please choose another.');
      }
      throw error;
    }

    await this.sendBookingEmails(appointment, settings);
    await this.scheduleReminder(appointment, settings);

    return appointment;
  }

  listAppointments(
    filter: AppointmentListFilter,
    pagination: Pagination,
  ): Promise<Paginated<Appointment>> {
    return this.appointmentRepository.findMany(filter, pagination);
  }

  async getAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }
    return appointment;
  }

  async updateAppointment(id: string, input: AdminUpdateAppointmentInput): Promise<Appointment> {
    const existing = await this.getAppointment(id);
    const settings = await this.settingsRepository.get();

    const nextDate = input.appointmentDate ?? existing.appointmentDate;
    const nextSlot = input.timeSlot ?? existing.timeSlot;
    const slotChanged =
      nextDate !== existing.appointmentDate || nextSlot !== existing.timeSlot;

    if (slotChanged && SLOT_HOLDING_STATUSES.includes(existing.status)) {
      await this.assertBookableSlot(settings, nextDate, nextSlot, id);
    }

    if (input.appointmentType) {
      const type = settings.appointmentTypes.find((entry) => entry.id === input.appointmentType);
      if (!type) {
        throw new ValidationError('Invalid appointment type', [
          { field: 'appointmentType', message: 'Unknown appointment type' },
        ]);
      }
    }

    try {
      return await this.appointmentRepository.update(id, {
        ...input,
        firstName: input.firstName ? sanitizePlainText(input.firstName) : undefined,
        lastName: input.lastName ? sanitizePlainText(input.lastName) : undefined,
        notes:
          input.notes === null
            ? null
            : input.notes !== undefined
              ? sanitizePlainText(input.notes)
              : undefined,
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('This time slot is already booked');
      }
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    options: { note?: string; cancellationReason?: string; changedBy?: string } = {},
  ): Promise<Appointment> {
    const existing = await this.getAppointment(id);
    if (existing.status === status) {
      return existing;
    }

    const appointment = await this.appointmentRepository.updateStatus(id, status, {
      note: options.note ? sanitizePlainText(options.note) : undefined,
      cancellationReason: options.cancellationReason
        ? sanitizePlainText(options.cancellationReason)
        : undefined,
      changedBy: options.changedBy,
    });

    if (status === 'cancelled' || status === 'rejected' || status === 'completed' || status === 'no_show') {
      await this.appointmentRepository.updateReminder(id, { status: 'skipped' });
    }

    await this.sendStatusEmail(appointment);
    return appointment;
  }

  async reschedule(
    id: string,
    input: { appointmentDate: string; timeSlot: string; reason?: string; changedBy?: string },
  ): Promise<Appointment> {
    const settings = await this.settingsRepository.get();
    await this.assertBookableSlot(settings, input.appointmentDate, input.timeSlot, id);

    let appointment: Appointment;
    try {
      appointment = await this.appointmentRepository.reschedule(id, {
        appointmentDate: input.appointmentDate,
        timeSlot: input.timeSlot,
        reason: input.reason ? sanitizePlainText(input.reason) : undefined,
        changedBy: input.changedBy,
      });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('This time slot is already booked');
      }
      throw error;
    }

    await this.scheduleReminder(appointment, settings);
    await this.sendStatusEmail(appointment);
    return appointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.appointmentRepository.delete(id);
  }

  /** Called by the email post-delivery hook once a reminder has been delivered. */
  async markReminderDelivered(appointmentId: string): Promise<void> {
    await this.appointmentRepository.markReminderSent(appointmentId);
  }

  /** Returns false when the reminder should be skipped (already sent / cancelled / etc.). */
  async shouldSendReminder(appointmentId: string): Promise<boolean> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      return false;
    }
    if (appointment.reminder.status === 'sent' || appointment.reminder.status === 'skipped') {
      return false;
    }
    return SLOT_HOLDING_STATUSES.includes(appointment.status);
  }

  private sanitizeCreateInput(input: CreateAppointmentInput): CreateAppointmentInput {
    return {
      firstName: sanitizePlainText(input.firstName),
      lastName: sanitizePlainText(input.lastName),
      email: input.email.trim().toLowerCase(),
      phone: sanitizePlainText(input.phone),
      appointmentDate: input.appointmentDate,
      timeSlot: input.timeSlot,
      appointmentType: input.appointmentType.trim(),
      notes: input.notes ? sanitizePlainText(input.notes) : undefined,
    };
  }

  private async assertBookableSlot(
    settings: AppointmentSettings,
    date: string,
    timeSlot: string,
    excludeId?: string,
  ): Promise<void> {
    const availability = await this.getAvailability(date);
    if (!availability.isOpen && availability.closedReason !== 'fully_booked') {
      throw new ValidationError('Selected date is not available', [
        {
          field: 'appointmentDate',
          message: this.closedReasonMessage(availability.closedReason),
        },
      ]);
    }

    if (!isSlotAvailableOnDay(availability, timeSlot)) {
      const slot = availability.slots.find((entry) => entry.time === timeSlot);
      throw new ValidationError('Selected time slot is not available', [
        {
          field: 'timeSlot',
          message:
            slot?.reason === 'booked'
              ? 'This time slot is already booked'
              : slot?.reason === 'past'
                ? 'This time slot is in the past'
                : 'This time slot is not available',
        },
      ]);
    }

    const taken = await this.appointmentRepository.isSlotTaken(date, timeSlot, excludeId);
    if (taken) {
      throw new ConflictError('This time slot is already booked');
    }
  }

  private closedReasonMessage(reason: DayAvailability['closedReason']): string {
    switch (reason) {
      case 'weekday':
        return 'The atelier is closed on this day';
      case 'holiday':
        return 'The atelier is closed for a holiday on this date';
      case 'temporary_closure':
        return 'The atelier is temporarily closed on this date';
      case 'past':
        return 'Appointments cannot be booked in the past';
      case 'fully_booked':
        return 'This date is fully booked';
      default:
        return 'This date is not available';
    }
  }

  private async sendBookingEmails(
    appointment: Appointment,
    settings: AppointmentSettings,
  ): Promise<void> {
    const typeLabel = resolveTypeLabel(settings, appointment.appointmentType);
    const fullName = customerFullName(appointment);
    const adminUrl = `${env.APP_URL.replace(/\/$/, '')}/admin/appointments?id=${encodeURIComponent(appointment.id)}`;
    const address = settings.studioAddressLines.join(', ');

    await Promise.all([
      this.emailQueue.enqueue(
        {
          type: 'appointment-confirmation',
          to: appointment.email,
          appointmentId: appointment.id,
          referenceCode: appointment.referenceCode,
          customerName: fullName,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          appointmentType: typeLabel,
          studioAddress: address,
          contactPhone: settings.contactPhone,
          contactEmail: settings.contactEmail,
          cancellationPolicy: settings.cancellationPolicy,
        },
        { deduplicationId: `appointment-confirmation-${appointment.id}` },
      ),
      this.emailQueue.enqueue(
        {
          type: 'appointment-admin-notification',
          appointmentId: appointment.id,
          referenceCode: appointment.referenceCode,
          customerName: fullName,
          customerEmail: appointment.email,
          customerPhone: appointment.phone,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          appointmentType: typeLabel,
          notes: appointment.notes,
          adminAppointmentUrl: adminUrl,
        },
        { deduplicationId: `appointment-admin-${appointment.id}` },
      ),
    ]);

    const now = new Date();
    await this.appointmentRepository.markEmailNotification(appointment.id, {
      confirmationSentAt: now,
      adminNotificationSentAt: now,
    });
  }

  private async sendStatusEmail(appointment: Appointment): Promise<void> {
    if (!STATUS_EMAIL_STATUSES.includes(appointment.status)) {
      return;
    }

    const settings = await this.settingsRepository.get();
    const typeLabel = resolveTypeLabel(settings, appointment.appointmentType);

    await this.emailQueue.enqueue(
      {
        type: 'appointment-status-update',
        to: appointment.email,
        appointmentId: appointment.id,
        referenceCode: appointment.referenceCode,
        customerName: customerFullName(appointment),
        status: appointment.status,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        appointmentType: typeLabel,
        studioAddress: settings.studioAddressLines.join(', '),
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail,
        cancellationReason: appointment.cancellationReason,
      },
      {
        deduplicationId: `appointment-status-${appointment.id}-${appointment.status}-${appointment.updatedAt.getTime()}`,
      },
    );

    await this.appointmentRepository.markEmailNotification(appointment.id, {
      statusEmail: { status: appointment.status, sentAt: new Date() },
    });
  }

  private async scheduleReminder(
    appointment: Appointment,
    settings: AppointmentSettings,
  ): Promise<void> {
    const startsAt = zonedDateTimeToUtc(
      appointment.appointmentDate,
      appointment.timeSlot,
      settings.timezone,
    );
    const remindAt = new Date(startsAt.getTime() - REMINDER_LEAD_MS);
    const now = Date.now();

    if (remindAt.getTime() <= now) {
      await this.appointmentRepository.updateReminder(appointment.id, { status: 'skipped' });
      return;
    }

    const delaySeconds = Math.ceil((remindAt.getTime() - now) / 1000);
    const typeLabel = resolveTypeLabel(settings, appointment.appointmentType);

    await this.emailQueue.enqueue(
      {
        type: 'appointment-reminder',
        to: appointment.email,
        appointmentId: appointment.id,
        referenceCode: appointment.referenceCode,
        customerName: customerFullName(appointment),
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        appointmentType: typeLabel,
        studioAddress: settings.studioAddressLines.join(', '),
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail,
        guidelines: settings.guidelines,
      },
      {
        deduplicationId: `appointment-reminder-${appointment.id}-${appointment.appointmentDate}-${appointment.timeSlot}`,
        delaySeconds,
      },
    );

    await this.appointmentRepository.updateReminder(appointment.id, {
      status: 'scheduled',
      scheduledFor: remindAt,
    });
  }
}
