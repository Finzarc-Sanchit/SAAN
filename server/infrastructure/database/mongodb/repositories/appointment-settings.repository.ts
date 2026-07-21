import { DEFAULT_APPOINTMENT_SETTINGS } from '../../../../modules/appointment/appointment.constants';
import type { IAppointmentSettingsRepository } from '../../../../modules/appointment/appointment-settings.repository.interface';
import type {
  AppointmentSettings,
  UpdateAppointmentSettingsInput,
} from '../../../../modules/appointment/appointment.types';
import {
  APPOINTMENT_SETTINGS_SINGLETON_KEY,
  AppointmentSettingsModel,
  toDomainAppointmentSettings,
  type AppointmentSettingsDocument,
} from '../models/appointment-settings.model';

export class MongoAppointmentSettingsRepository implements IAppointmentSettingsRepository {
  async get(): Promise<AppointmentSettings> {
    let doc = await AppointmentSettingsModel.findOne({ key: APPOINTMENT_SETTINGS_SINGLETON_KEY })
      .lean<AppointmentSettingsDocument>()
      .exec();

    if (!doc) {
      const created = await AppointmentSettingsModel.create({
        key: APPOINTMENT_SETTINGS_SINGLETON_KEY,
        ...DEFAULT_APPOINTMENT_SETTINGS,
      });
      doc = created.toObject() as AppointmentSettingsDocument;
    }

    return toDomainAppointmentSettings(doc);
  }

  async update(data: UpdateAppointmentSettingsInput): Promise<AppointmentSettings> {
    await this.get();

    const doc = await AppointmentSettingsModel.findOneAndUpdate(
      { key: APPOINTMENT_SETTINGS_SINGLETON_KEY },
      { $set: data },
      { new: true, runValidators: true },
    )
      .lean<AppointmentSettingsDocument>()
      .exec();

    if (!doc) {
      return this.get();
    }

    return toDomainAppointmentSettings(doc);
  }
}
