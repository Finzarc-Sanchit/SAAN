import { logger } from '../../middlewares/request-logger';
import { getEmailDeliveryHooks } from './email-delivery-hook';
import type { IEmailDeliveryService } from './email-delivery.interface';
import type { EmailJob } from './email-job.types';
import type { EmailQueueOptions, IEmailQueue } from './email-queue.interface';

/**
 * Development-only queue. Production uses QStash so jobs survive process exits
 * and serverless function suspension.
 */
export class InProcessEmailQueue implements IEmailQueue {
  constructor(private readonly deliveryService: IEmailDeliveryService) {}

  async enqueue(job: EmailJob, options: EmailQueueOptions = {}): Promise<void> {
    const delayMs = Math.max(0, (options.delaySeconds ?? 0) * 1000);
    const run = () => {
      void this.deliverWithHooks(job).catch((error: unknown) => {
        logger.error({ err: error, emailType: job.type }, 'In-process email delivery failed');
      });
    };

    if (delayMs > 0) {
      setTimeout(run, delayMs);
      return;
    }

    setImmediate(run);
  }

  private async deliverWithHooks(job: EmailJob): Promise<void> {
    const hooks = getEmailDeliveryHooks();
    for (const hook of hooks) {
      if (!hook.beforeDeliver) continue;
      const decision = await hook.beforeDeliver(job);
      if (decision === 'skip') {
        return;
      }
    }

    await this.deliveryService.deliver(job);

    for (const hook of hooks) {
      if (hook.afterDeliver) {
        await hook.afterDeliver(job);
      }
    }
  }
}
