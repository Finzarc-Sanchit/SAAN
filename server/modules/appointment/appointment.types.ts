/** Configurable appointment types — labels live in settings; ids are stable keys. */
export const DEFAULT_APPOINTMENT_TYPE_IDS = [
  'bridal_consultation',
  'custom_tailoring',
  'private_styling',
  'measurement_session',
  'alteration_consultation',
  'collection_preview',
  'general_consultation',
] as const;

export type DefaultAppointmentTypeId = (typeof DEFAULT_APPOINTMENT_TYPE_IDS)[number];

export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
  'no_show',
  'rescheduled',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Statuses that occupy a calendar slot (cannot be double-booked). */
export const SLOT_HOLDING_STATUSES: readonly AppointmentStatus[] = [
  'pending',
  'confirmed',
  'rescheduled',
] as const;

export const REMINDER_STATUSES = ['pending', 'scheduled', 'sent', 'skipped'] as const;

export type ReminderStatus = (typeof REMINDER_STATUSES)[number];

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type AppointmentTypeConfig = {
  id: string;
  label: string;
  isActive: boolean;
};

export type TemporaryClosure = {
  date: string;
  reason?: string;
};

export type SpecialOpeningDay = {
  date: string;
  openingTime: string;
  closingTime: string;
};

export type AppointmentSettings = {
  id: string;
  workingDays: Weekday[];
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  maxAppointmentsPerDay: number;
  holidays: string[];
  temporaryClosures: TemporaryClosure[];
  specialOpeningDays: SpecialOpeningDay[];
  appointmentTypes: AppointmentTypeConfig[];
  timezone: string;
  studioAddressLines: string[];
  contactPhone: string;
  contactEmail: string;
  cancellationPolicy: string;
  guidelines: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateAppointmentSettingsInput = Partial<
  Omit<AppointmentSettings, 'id' | 'createdAt' | 'updatedAt'>
>;

export type AppointmentStatusHistoryEntry = {
  status: AppointmentStatus;
  at: Date;
  note?: string;
  changedBy?: string;
};

export type AppointmentRescheduleInfo = {
  previousDate: string;
  previousTimeSlot: string;
  rescheduledAt: Date;
  reason?: string;
};

export type AppointmentEmailNotifications = {
  confirmationSentAt?: Date;
  adminNotificationSentAt?: Date;
  statusEmails: Array<{ status: AppointmentStatus; sentAt: Date }>;
};

export type AppointmentReminder = {
  status: ReminderStatus;
  scheduledFor?: Date;
  sentAt?: Date;
};

/** Database-agnostic representation of an atelier appointment. */
export interface Appointment {
  id: string;
  referenceCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentDate: string;
  timeSlot: string;
  durationMinutes: number;
  appointmentType: string;
  notes?: string;
  status: AppointmentStatus;
  statusHistory: AppointmentStatusHistoryEntry[];
  cancellationReason?: string;
  reschedule?: AppointmentRescheduleInfo;
  emailNotifications: AppointmentEmailNotifications;
  reminder: AppointmentReminder;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAppointmentInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: string;
  notes?: string;
};

export type AppointmentListFilter = {
  status?: AppointmentStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  appointmentType?: string;
};

export type AdminUpdateAppointmentInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  appointmentType?: string;
  notes?: string | null;
  appointmentDate?: string;
  timeSlot?: string;
  cancellationReason?: string;
  status?: AppointmentStatus;
  statusNote?: string;
  changedBy?: string;
};

export type TimeSlotAvailability = {
  time: string;
  available: boolean;
  reason?: 'booked' | 'past' | 'buffer' | 'closed';
};

export type DayAvailability = {
  date: string;
  isOpen: boolean;
  closedReason?: 'weekday' | 'holiday' | 'temporary_closure' | 'fully_booked' | 'past';
  openingTime?: string;
  closingTime?: string;
  slotDurationMinutes: number;
  slots: TimeSlotAvailability[];
  bookedCount: number;
  maxAppointmentsPerDay: number;
};
