import type { AppointmentSettings, AppointmentTypeConfig, Weekday } from './appointment.types';

export const DEFAULT_APPOINTMENT_TYPES: AppointmentTypeConfig[] = [
  { id: 'bridal_consultation', label: 'Bridal Consultation', isActive: true },
  { id: 'custom_tailoring', label: 'Custom Tailoring', isActive: true },
  { id: 'private_styling', label: 'Private Styling', isActive: true },
  { id: 'measurement_session', label: 'Measurement Session', isActive: true },
  { id: 'alteration_consultation', label: 'Alteration Consultation', isActive: true },
  { id: 'collection_preview', label: 'Collection Preview', isActive: true },
  { id: 'general_consultation', label: 'General Consultation', isActive: true },
];

/** Default atelier hours aligned with public visit copy (Tue–Sat, 11:00–19:00 IST). */
export const DEFAULT_APPOINTMENT_SETTINGS: Omit<
  AppointmentSettings,
  'id' | 'createdAt' | 'updatedAt'
> = {
  workingDays: [2, 3, 4, 5, 6] as Weekday[],
  openingTime: '11:00',
  closingTime: '19:00',
  slotDurationMinutes: 60,
  bufferMinutes: 0,
  maxAppointmentsPerDay: 12,
  holidays: [],
  temporaryClosures: [],
  specialOpeningDays: [],
  appointmentTypes: DEFAULT_APPOINTMENT_TYPES,
  timezone: 'Asia/Kolkata',
  studioAddressLines: [
    'Pearl Heights, 1st Floor',
    'Linking Road, Bandra West',
    'Mumbai 400050',
  ],
  contactPhone: '+91 99206 13132',
  contactEmail: 'jueatakaur@gmail.com',
  cancellationPolicy:
    'Please cancel or reschedule at least 24 hours before your appointment so we can offer the slot to another guest.',
  guidelines: [
    'Arrive a few minutes early so we can begin your consultation on time.',
    'Bring reference images or garments if you are discussing a custom or alteration piece.',
    'Guests are welcome within the number indicated on your booking.',
  ],
};

export const DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_STRING_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
