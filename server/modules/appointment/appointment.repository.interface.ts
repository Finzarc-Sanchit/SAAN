import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  AdminUpdateAppointmentInput,
  Appointment,
  AppointmentListFilter,
  AppointmentReminder,
  AppointmentStatus,
  CreateAppointmentInput,
} from './appointment.types';

export type CreateAppointmentRecordInput = CreateAppointmentInput & {
  referenceCode: string;
  durationMinutes: number;
  status: AppointmentStatus;
};

export type BookedSlotSummary = {
  timeSlot: string;
  count: number;
};

/** Persistence contract for atelier appointments. */
export interface IAppointmentRepository {
  create(data: CreateAppointmentRecordInput): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findMany(filter: AppointmentListFilter, pagination: Pagination): Promise<Paginated<Appointment>>;
  update(id: string, data: AdminUpdateAppointmentInput): Promise<Appointment>;
  updateStatus(
    id: string,
    status: AppointmentStatus,
    options?: { note?: string; cancellationReason?: string; changedBy?: string },
  ): Promise<Appointment>;
  reschedule(
    id: string,
    data: {
      appointmentDate: string;
      timeSlot: string;
      reason?: string;
      changedBy?: string;
    },
  ): Promise<Appointment>;
  delete(id: string): Promise<void>;
  findBookedSlotsForDate(date: string): Promise<BookedSlotSummary[]>;
  countActiveForDate(date: string): Promise<number>;
  isSlotTaken(date: string, timeSlot: string, excludeId?: string): Promise<boolean>;
  updateReminder(id: string, reminder: AppointmentReminder): Promise<Appointment>;
  markReminderSent(id: string, sentAt?: Date): Promise<Appointment | null>;
  markEmailNotification(
    id: string,
    patch: {
      confirmationSentAt?: Date;
      adminNotificationSentAt?: Date;
      statusEmail?: { status: AppointmentStatus; sentAt: Date };
    },
  ): Promise<void>;
}
