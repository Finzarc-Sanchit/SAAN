import { z } from 'zod';

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

export const SLOT_UNAVAILABLE_REASONS = ['booked', 'past', 'buffer', 'closed'] as const;

export type SlotUnavailableReason = (typeof SLOT_UNAVAILABLE_REASONS)[number];

export const CLOSED_DAY_REASONS = [
  'weekday',
  'holiday',
  'temporary_closure',
  'fully_booked',
  'past',
] as const;

export type ClosedDayReason = (typeof CLOSED_DAY_REASONS)[number];

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
  createdAt: string;
  updatedAt: string;
};

export type PublicAppointmentSettings = Pick<
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

export type PublicAppointmentContext = {
  settings: PublicAppointmentSettings;
};

export type TimeSlotAvailability = {
  time: string;
  available: boolean;
  reason?: SlotUnavailableReason;
};

export type DayAvailability = {
  date: string;
  isOpen: boolean;
  closedReason?: ClosedDayReason;
  openingTime?: string;
  closingTime?: string;
  slotDurationMinutes: number;
  slots: TimeSlotAvailability[];
  bookedCount: number;
  maxAppointmentsPerDay: number;
};

const dateStringSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid date');

const timeStringSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please choose a valid time');

export const appointmentFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Please enter your first name')
    .max(80, 'First name is too long'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Please enter your last name')
    .max(80, 'Last name is too long'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .max(254, 'Email address is too long'),
  phone: z
    .string()
    .trim()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Please enter a valid phone number'),
  appointmentDate: dateStringSchema,
  timeSlot: z
    .string()
    .trim()
    .min(1, 'Please select a time')
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please choose a valid time'),
  appointmentType: z.string().trim().min(1, 'Please select an appointment type').max(80),
  notes: z.string().trim().max(5_000, 'Notes must be 5,000 characters or fewer').optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export type AppointmentStatusHistoryEntry = {
  status: AppointmentStatus;
  at: string;
  note?: string;
  changedBy?: string;
};

export type AppointmentRescheduleInfo = {
  previousDate: string;
  previousTimeSlot: string;
  rescheduledAt: string;
  reason?: string;
};

export type Appointment = {
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
  createdAt: string;
  updatedAt: string;
};

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

export type AdminAppointmentListParams = {
  search?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  appointmentType?: string;
  page?: number;
  limit?: number;
};

export type UpdateAppointmentStatusInput = {
  status: AppointmentStatus;
  note?: string;
  cancellationReason?: string;
};

export type RescheduleAppointmentInput = {
  appointmentDate: string;
  timeSlot: string;
  reason?: string;
};

export type UpdateAppointmentInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  appointmentType?: string;
  notes?: string | null;
  appointmentDate?: string;
  timeSlot?: string;
};

const weekdaySchema = z.coerce.number().int().min(0).max(6);

const appointmentTypeConfigSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  isActive: z.boolean(),
});

export const updateAppointmentSettingsSchema = z
  .object({
    workingDays: z.array(weekdaySchema).min(1).max(7).optional(),
    openingTime: timeStringSchema.optional(),
    closingTime: timeStringSchema.optional(),
    slotDurationMinutes: z.coerce.number().int().min(15).max(240).optional(),
    bufferMinutes: z.coerce.number().int().min(0).max(120).optional(),
    maxAppointmentsPerDay: z.coerce.number().int().min(1).max(100).optional(),
    holidays: z.array(dateStringSchema).max(366).optional(),
    temporaryClosures: z
      .array(
        z.object({
          date: dateStringSchema,
          reason: z.string().trim().max(200).optional(),
        }),
      )
      .max(366)
      .optional(),
    specialOpeningDays: z
      .array(
        z.object({
          date: dateStringSchema,
          openingTime: timeStringSchema,
          closingTime: timeStringSchema,
        }),
      )
      .max(366)
      .optional(),
    appointmentTypes: z.array(appointmentTypeConfigSchema).min(1).max(30).optional(),
    timezone: z.string().trim().min(1).max(64).optional(),
    studioAddressLines: z.array(z.string().trim().min(1).max(200)).min(1).max(6).optional(),
    contactPhone: z.string().trim().min(10).max(20).optional(),
    contactEmail: z.string().trim().email().max(254).optional(),
    cancellationPolicy: z.string().trim().min(10).max(2_000).optional(),
    guidelines: z.array(z.string().trim().min(1).max(400)).max(12).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.openingTime && data.closingTime) {
      const [openH, openM] = data.openingTime.split(':').map(Number);
      const [closeH, closeM] = data.closingTime.split(':').map(Number);
      const open = (openH ?? 0) * 60 + (openM ?? 0);
      const close = (closeH ?? 0) * 60 + (closeM ?? 0);
      if (close <= open) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Closing time must be after opening time',
          path: ['closingTime'],
        });
      }
    }
  });

export type UpdateAppointmentSettingsInput = z.infer<typeof updateAppointmentSettingsSchema>;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  no_show: 'No show',
  rescheduled: 'Rescheduled',
};
