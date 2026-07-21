import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';
import { DATE_STRING_REGEX, TIME_STRING_REGEX } from './appointment.constants';
import { APPOINTMENT_STATUSES } from './appointment.types';

const dateStringSchema = z
  .string()
  .trim()
  .regex(DATE_STRING_REGEX, 'Date must be YYYY-MM-DD');

const timeStringSchema = z
  .string()
  .trim()
  .regex(TIME_STRING_REGEX, 'Time must be HH:mm');

export const createAppointmentDto = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  phone: z.string().trim().min(10).max(20),
  appointmentDate: dateStringSchema,
  timeSlot: timeStringSchema,
  appointmentType: z.string().trim().min(1).max(80),
  notes: z.string().trim().max(5_000).optional(),
});

export const availabilityQueryDto = z.object({
  date: dateStringSchema,
});

export const appointmentListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  appointmentType: z.string().trim().min(1).max(80).optional(),
});

export const appointmentIdParamsDto = z.object({
  id: z.string().min(1, 'Appointment id is required'),
});

export const updateAppointmentStatusDto = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
  note: z.string().trim().max(1_000).optional(),
  cancellationReason: z.string().trim().max(1_000).optional(),
});

export const rescheduleAppointmentDto = z.object({
  appointmentDate: dateStringSchema,
  timeSlot: timeStringSchema,
  reason: z.string().trim().max(1_000).optional(),
});

export const updateAppointmentDto = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase())
    .optional(),
  phone: z.string().trim().min(10).max(20).optional(),
  appointmentType: z.string().trim().min(1).max(80).optional(),
  notes: z.string().trim().max(5_000).nullable().optional(),
  appointmentDate: dateStringSchema.optional(),
  timeSlot: timeStringSchema.optional(),
});

const weekdaySchema = z.coerce
  .number()
  .int()
  .min(0)
  .max(6)
  .transform((value) => value as 0 | 1 | 2 | 3 | 4 | 5 | 6);

const appointmentTypeConfigSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  isActive: z.boolean(),
});

export const updateAppointmentSettingsDto = z
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

export type CreateAppointmentDto = z.infer<typeof createAppointmentDto>;
export type AvailabilityQueryDto = z.infer<typeof availabilityQueryDto>;
export type AppointmentListQueryDto = z.infer<typeof appointmentListQueryDto>;
export type UpdateAppointmentStatusDto = z.infer<typeof updateAppointmentStatusDto>;
export type RescheduleAppointmentDto = z.infer<typeof rescheduleAppointmentDto>;
export type UpdateAppointmentDto = z.infer<typeof updateAppointmentDto>;
export type UpdateAppointmentSettingsDto = z.infer<typeof updateAppointmentSettingsDto>;
