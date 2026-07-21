import type {
  AppointmentSettings,
  UpdateAppointmentSettingsInput,
} from './appointment.types';

/** Persistence contract for appointment studio settings (singleton). */
export interface IAppointmentSettingsRepository {
  get(): Promise<AppointmentSettings>;
  update(data: UpdateAppointmentSettingsInput): Promise<AppointmentSettings>;
}
