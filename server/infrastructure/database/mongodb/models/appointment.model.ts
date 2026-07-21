import { Schema, model, type Types } from 'mongoose';
import {
  APPOINTMENT_STATUSES,
  REMINDER_STATUSES,
  SLOT_HOLDING_STATUSES,
  type AppointmentStatus,
  type ReminderStatus,
} from '../../../../modules/appointment/appointment.types';

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: APPOINTMENT_STATUSES, required: true },
    at: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 1_000 },
    changedBy: { type: String, trim: true, maxlength: 120 },
  },
  { _id: false },
);

const rescheduleSchema = new Schema(
  {
    previousDate: { type: String, required: true },
    previousTimeSlot: { type: String, required: true },
    rescheduledAt: { type: Date, required: true },
    reason: { type: String, trim: true, maxlength: 1_000 },
  },
  { _id: false },
);

const statusEmailSchema = new Schema(
  {
    status: { type: String, enum: APPOINTMENT_STATUSES, required: true },
    sentAt: { type: Date, required: true },
  },
  { _id: false },
);

const appointmentSchema = new Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 32,
      index: true,
    },
    firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    phone: { type: String, required: true, trim: true, minlength: 10, maxlength: 20 },
    appointmentDate: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 15, max: 240 },
    appointmentType: { type: String, required: true, trim: true, maxlength: 80, index: true },
    notes: { type: String, trim: true, maxlength: 5_000 },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      required: true,
      default: 'pending',
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    cancellationReason: { type: String, trim: true, maxlength: 1_000 },
    reschedule: { type: rescheduleSchema },
    emailNotifications: {
      confirmationSentAt: { type: Date },
      adminNotificationSentAt: { type: Date },
      statusEmails: { type: [statusEmailSchema], default: [] },
    },
    reminder: {
      status: {
        type: String,
        enum: REMINDER_STATUSES,
        required: true,
        default: 'pending',
      },
      scheduledFor: { type: Date },
      sentAt: { type: Date },
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ appointmentDate: 1, timeSlot: 1 });
appointmentSchema.index(
  { appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [...SLOT_HOLDING_STATUSES] },
    },
  },
);
appointmentSchema.index({ status: 1, appointmentDate: -1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ 'reminder.status': 1, 'reminder.scheduledFor': 1 });

export const AppointmentModel = model('Appointment', appointmentSchema);

export type AppointmentDocument = {
  _id: Types.ObjectId;
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
  statusHistory: Array<{
    status: AppointmentStatus;
    at: Date;
    note?: string;
    changedBy?: string;
  }>;
  cancellationReason?: string;
  reschedule?: {
    previousDate: string;
    previousTimeSlot: string;
    rescheduledAt: Date;
    reason?: string;
  };
  emailNotifications: {
    confirmationSentAt?: Date;
    adminNotificationSentAt?: Date;
    statusEmails: Array<{ status: AppointmentStatus; sentAt: Date }>;
  };
  reminder: {
    status: ReminderStatus;
    scheduledFor?: Date;
    sentAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};
