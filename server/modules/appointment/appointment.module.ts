import type { EmailJob } from '../../infrastructure/email/email-job.types';
import {
  clearEmailDeliveryHooks,
  registerEmailDeliveryHook,
  type IEmailDeliveryHook,
} from '../../infrastructure/email/email-delivery-hook';
import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { MongoAppointmentSettingsRepository } from '../../infrastructure/database/mongodb/repositories/appointment-settings.repository';
import { MongoAppointmentRepository } from '../../infrastructure/database/mongodb/repositories/appointment.repository';
import { AppointmentController } from './appointment.controller';
import { createAppointmentRoutes } from './appointment.routes';
import { AppointmentService } from './appointment.service';

class AppointmentEmailHook implements IEmailDeliveryHook {
  constructor(private readonly appointmentService: AppointmentService) {}

  async beforeDeliver(job: EmailJob): Promise<'proceed' | 'skip'> {
    if (job.type !== 'appointment-reminder') {
      return 'proceed';
    }
    const shouldSend = await this.appointmentService.shouldSendReminder(job.appointmentId);
    return shouldSend ? 'proceed' : 'skip';
  }

  async afterDeliver(job: EmailJob): Promise<void> {
    if (job.type === 'appointment-reminder') {
      await this.appointmentService.markReminderDelivered(job.appointmentId);
    }
  }
}

/** Composes the appointment module while keeping its email queue dependency injectable. */
export function createAppointmentModule(emailQueue: IEmailQueue) {
  const appointmentRepository = new MongoAppointmentRepository();
  const settingsRepository = new MongoAppointmentSettingsRepository();
  const appointmentService = new AppointmentService(
    appointmentRepository,
    settingsRepository,
    emailQueue,
  );
  const appointmentController = new AppointmentController(appointmentService);
  const routes = createAppointmentRoutes(appointmentController);

  clearEmailDeliveryHooks();
  registerEmailDeliveryHook(new AppointmentEmailHook(appointmentService));

  return {
    appointmentRoutes: routes.publicRoutes,
    adminAppointmentRoutes: routes.adminRoutes,
    adminAppointmentSettingsRoutes: routes.adminSettingsRoutes,
    appointmentRepository,
    settingsRepository,
    appointmentService,
    appointmentController,
  };
}

export type AppointmentModule = ReturnType<typeof createAppointmentModule>;
