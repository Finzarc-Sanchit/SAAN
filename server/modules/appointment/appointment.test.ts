import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { ConflictError } from '../../shared/errors/conflict-error';
import { ValidationError } from '../../shared/errors/validation-error';
import { DEFAULT_APPOINTMENT_SETTINGS } from './appointment.constants';
import type { IAppointmentSettingsRepository } from './appointment-settings.repository.interface';
import type { IAppointmentRepository } from './appointment.repository.interface';
import { AppointmentService } from './appointment.service';
import type {
  Appointment,
  AppointmentSettings,
  CreateAppointmentInput,
  DayAvailability,
} from './appointment.types';

const settings: AppointmentSettings = {
  id: 'settings-1',
  ...DEFAULT_APPOINTMENT_SETTINGS,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

function futureTuesday(): string {
  const now = new Date();
  const probe = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  for (let i = 0; i < 14; i += 1) {
    const y = probe.getUTCFullYear();
    const m = String(probe.getUTCMonth() + 1).padStart(2, '0');
    const d = String(probe.getUTCDate()).padStart(2, '0');
    const date = `${y}-${m}-${d}`;
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
    }).format(new Date(`${date}T12:00:00.000Z`));
    if (weekday === 'Tue') {
      return date;
    }
    probe.setUTCDate(probe.getUTCDate() + 1);
  }
  return '2026-07-28';
}

const appointmentDate = futureTuesday();

const appointment: Appointment = {
  id: 'appt-1',
  referenceCode: 'SAAN-20260728-ABCD',
  firstName: 'Aanya',
  lastName: 'Shah',
  email: 'aanya@example.com',
  phone: '+919876543210',
  appointmentDate,
  timeSlot: '11:00',
  durationMinutes: 60,
  appointmentType: 'bridal_consultation',
  notes: 'Looking for ivory tones.',
  status: 'pending',
  statusHistory: [{ status: 'pending', at: new Date('2026-07-17T10:00:00Z') }],
  emailNotifications: { statusEmails: [] },
  reminder: { status: 'pending' },
  createdAt: new Date('2026-07-17T10:00:00Z'),
  updatedAt: new Date('2026-07-17T10:00:00Z'),
};

const input: CreateAppointmentInput = {
  firstName: 'Aanya',
  lastName: 'Shah',
  email: '  AANYA@EXAMPLE.COM ',
  phone: '+919876543210',
  appointmentDate,
  timeSlot: '11:00',
  appointmentType: 'bridal_consultation',
  notes: 'Looking for ivory tones.',
};

function repositoryMock(): jest.Mocked<IAppointmentRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    reschedule: jest.fn(),
    delete: jest.fn(),
    findBookedSlotsForDate: jest.fn(),
    countActiveForDate: jest.fn(),
    isSlotTaken: jest.fn(),
    updateReminder: jest.fn(),
    markReminderSent: jest.fn(),
    markEmailNotification: jest.fn(),
  };
}

function settingsMock(): jest.Mocked<IAppointmentSettingsRepository> {
  return {
    get: jest.fn(),
    update: jest.fn(),
  };
}

function queueMock(): jest.Mocked<IEmailQueue> {
  return { enqueue: jest.fn<IEmailQueue['enqueue']>().mockResolvedValue(undefined) };
}

describe('AppointmentService', () => {
  let repository: jest.Mocked<IAppointmentRepository>;
  let settingsRepository: jest.Mocked<IAppointmentSettingsRepository>;
  let queue: jest.Mocked<IEmailQueue>;
  let service: AppointmentService;

  beforeEach(() => {
    repository = repositoryMock();
    settingsRepository = settingsMock();
    queue = queueMock();
    service = new AppointmentService(repository, settingsRepository, queue);

    settingsRepository.get.mockResolvedValue(settings);
    repository.findBookedSlotsForDate.mockResolvedValue([]);
    repository.countActiveForDate.mockResolvedValue(0);
    repository.isSlotTaken.mockResolvedValue(false);
    repository.markEmailNotification.mockResolvedValue();
    repository.updateReminder.mockResolvedValue({
      ...appointment,
      reminder: { status: 'scheduled', scheduledFor: new Date() },
    });
  });

  it('books an appointment and enqueues confirmation, admin, and reminder emails', async () => {
    repository.create.mockResolvedValue(appointment);

    await expect(service.createAppointment(input)).resolves.toEqual(appointment);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Aanya',
        email: 'aanya@example.com',
        appointmentDate,
        timeSlot: '11:00',
        status: 'pending',
      }),
    );
    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'appointment-confirmation' }),
      expect.objectContaining({ deduplicationId: 'appointment-confirmation-appt-1' }),
    );
    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'appointment-admin-notification' }),
      expect.objectContaining({ deduplicationId: 'appointment-admin-appt-1' }),
    );
    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'appointment-reminder' }),
      expect.objectContaining({
        deduplicationId: expect.stringContaining('appointment-reminder-appt-1'),
      }),
    );
  });

  it('rejects bookings on closed weekdays', async () => {
    // Find a Monday
    const monday = (() => {
      const probe = new Date(`${appointmentDate}T12:00:00.000Z`);
      while (
        new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(
          probe,
        ) !== 'Mon'
      ) {
        probe.setUTCDate(probe.getUTCDate() + 1);
      }
      const y = probe.getUTCFullYear();
      const m = String(probe.getUTCMonth() + 1).padStart(2, '0');
      const d = String(probe.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();

    await expect(
      service.createAppointment({ ...input, appointmentDate: monday }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects holiday dates', async () => {
    settingsRepository.get.mockResolvedValue({
      ...settings,
      holidays: [appointmentDate],
    });

    await expect(service.createAppointment(input)).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects already booked slots', async () => {
    repository.findBookedSlotsForDate.mockResolvedValue([{ timeSlot: '11:00', count: 1 }]);

    await expect(service.createAppointment(input)).rejects.toBeInstanceOf(ValidationError);
  });

  it('maps duplicate key errors to ConflictError', async () => {
    repository.create.mockRejectedValue({ code: 11000 });

    await expect(service.createAppointment(input)).rejects.toBeInstanceOf(ConflictError);
  });

  it('sends status email when admin confirms', async () => {
    const confirmed = { ...appointment, status: 'confirmed' as const };
    repository.findById.mockResolvedValue(appointment);
    repository.updateStatus.mockResolvedValue(confirmed);

    await expect(service.updateStatus('appt-1', 'confirmed')).resolves.toEqual(confirmed);
    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'appointment-status-update', status: 'confirmed' }),
      expect.any(Object),
    );
  });

  it('skips reminder when appointment is cancelled', async () => {
    repository.findById.mockResolvedValue({
      ...appointment,
      status: 'cancelled',
      reminder: { status: 'scheduled' },
    });
    await expect(service.shouldSendReminder('appt-1')).resolves.toBe(false);
  });

  it('returns availability with booked slots marked unavailable', async () => {
    repository.findBookedSlotsForDate.mockResolvedValue([{ timeSlot: '11:00', count: 1 }]);
    repository.countActiveForDate.mockResolvedValue(1);

    const availability: DayAvailability = await service.getAvailability(appointmentDate);
    expect(availability.slots.length).toBeGreaterThan(0);
    const booked = availability.slots.find((slot) => slot.time === '11:00');
    expect(booked?.available).toBe(false);
    expect(booked?.reason).toBe('booked');
  });
});
