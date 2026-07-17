import { logger } from '../../middlewares/request-logger';
import type { IEmailDeliveryService } from './email-delivery.interface';
import type { EmailJob } from './email-job.types';
import type { IEmailQueue } from './email-queue.interface';

/**
 * Development-only queue. Production uses QStash so jobs survive process exits
 * and serverless function suspension.
 */
export class InProcessEmailQueue implements IEmailQueue {
  constructor(private readonly deliveryService: IEmailDeliveryService) {}

  async enqueue(job: EmailJob): Promise<void> {
    setImmediate(() => {
      void this.deliveryService.deliver(job).catch((error: unknown) => {
        logger.error({ err: error, emailType: job.type }, 'In-process email delivery failed');
      });
    });
  }
}
