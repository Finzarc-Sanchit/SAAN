import { Schema, model, type Types } from 'mongoose';
import { DEFAULT_APPOINTMENT_SETTINGS } from '../../../../modules/appointment/appointment.constants';
import type {
  AppointmentSettings,
  AppointmentTypeConfig,
  SpecialOpeningDay,
  TemporaryClosure,
  Weekday,
} from '../../../../modules/appointment/appointment.types';

const SETTINGS_SINGLETON_KEY = 'default';

const appointmentTypeSchema = new Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 80 },
    label: { type: String, required: true, trim: true, maxlength: 120 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { _id: false },
);

const temporaryClosureSchema = new Schema(
  {
    date: { type: String, required: true },
    reason: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false },
);

const specialOpeningDaySchema = new Schema(
  {
    date: { type: String, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
  },
  { _id: false },
);

const appointmentSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: SETTINGS_SINGLETON_KEY },
    workingDays: {
      type: [Number],
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.workingDays,
    },
    openingTime: {
      type: String,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.openingTime,
    },
    closingTime: {
      type: String,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.closingTime,
    },
    slotDurationMinutes: {
      type: Number,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.slotDurationMinutes,
      min: 15,
      max: 240,
    },
    bufferMinutes: {
      type: Number,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.bufferMinutes,
      min: 0,
      max: 120,
    },
    maxAppointmentsPerDay: {
      type: Number,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.maxAppointmentsPerDay,
      min: 1,
      max: 100,
    },
    holidays: { type: [String], default: [] },
    temporaryClosures: { type: [temporaryClosureSchema], default: [] },
    specialOpeningDays: { type: [specialOpeningDaySchema], default: [] },
    appointmentTypes: {
      type: [appointmentTypeSchema],
      default: DEFAULT_APPOINTMENT_SETTINGS.appointmentTypes,
    },
    timezone: {
      type: String,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.timezone,
    },
    studioAddressLines: {
      type: [String],
      default: DEFAULT_APPOINTMENT_SETTINGS.studioAddressLines,
    },
    contactPhone: {
      type: String,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.contactPhone,
    },
    contactEmail: {
      type: String,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.contactEmail,
    },
    cancellationPolicy: {
      type: String,
      required: true,
      default: DEFAULT_APPOINTMENT_SETTINGS.cancellationPolicy,
    },
    guidelines: {
      type: [String],
      default: DEFAULT_APPOINTMENT_SETTINGS.guidelines,
    },
  },
  { timestamps: true },
);

export const AppointmentSettingsModel = model('AppointmentSettings', appointmentSettingsSchema);

export const APPOINTMENT_SETTINGS_SINGLETON_KEY = SETTINGS_SINGLETON_KEY;

export type AppointmentSettingsDocument = {
  _id: Types.ObjectId;
  key: string;
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

export function toDomainAppointmentSettings(doc: AppointmentSettingsDocument): AppointmentSettings {
  return {
    id: doc._id.toString(),
    workingDays: doc.workingDays as Weekday[],
    openingTime: doc.openingTime,
    closingTime: doc.closingTime,
    slotDurationMinutes: doc.slotDurationMinutes,
    bufferMinutes: doc.bufferMinutes,
    maxAppointmentsPerDay: doc.maxAppointmentsPerDay,
    holidays: doc.holidays,
    temporaryClosures: doc.temporaryClosures,
    specialOpeningDays: doc.specialOpeningDays,
    appointmentTypes: doc.appointmentTypes,
    timezone: doc.timezone,
    studioAddressLines: doc.studioAddressLines,
    contactPhone: doc.contactPhone,
    contactEmail: doc.contactEmail,
    cancellationPolicy: doc.cancellationPolicy,
    guidelines: doc.guidelines,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
