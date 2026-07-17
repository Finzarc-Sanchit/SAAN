import { env } from '../../config/env';
import { EmailJobController } from './email-job.controller';
import { createEmailJobRoutes } from './email-job.routes';
import type { IEmailQueue } from './email-queue.interface';
import { InProcessEmailQueue } from './in-process-email.queue';
import { NodemailerEmailService } from './nodemailer-email.service';
import { QStashEmailQueue } from './qstash-email.queue';

export const emailDeliveryService = new NodemailerEmailService();

export const emailQueue: IEmailQueue =
  env.EMAIL_QUEUE_DRIVER === 'qstash'
    ? new QStashEmailQueue()
    : new InProcessEmailQueue(emailDeliveryService);

const emailJobController = new EmailJobController(emailDeliveryService);
export const emailJobRoutes = createEmailJobRoutes(emailJobController);
