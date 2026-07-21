import { Client } from '@upstash/qstash';
import { env } from '../../config/env';
import type { EmailJob } from './email-job.types';
import type { EmailQueueOptions, IEmailQueue } from './email-queue.interface';

function requireQStashConfig(): { token: string; destinationUrl: string } {
  if (!env.QSTASH_TOKEN || !env.SERVER_PUBLIC_URL) {
    throw new Error('QStash email queue is missing QSTASH_TOKEN or SERVER_PUBLIC_URL');
  }

  return {
    token: env.QSTASH_TOKEN,
    destinationUrl: new URL('/api/v1/internal/email-jobs', env.SERVER_PUBLIC_URL).toString(),
  };
}

/** Serverless-safe email queue backed by QStash delivery and retries. */
export class QStashEmailQueue implements IEmailQueue {
  private readonly client: Client;
  private readonly destinationUrl: string;

  constructor() {
    const config = requireQStashConfig();
    this.client = new Client({ token: config.token });
    this.destinationUrl = config.destinationUrl;
  }

  async enqueue(job: EmailJob, options: EmailQueueOptions = {}): Promise<void> {
    await this.client.publishJSON({
      url: this.destinationUrl,
      body: job,
      retries: 5,
      timeout: 30,
      flowControl: {
        key: 'saan-transactional-email',
        parallelism: 5,
        rate: 20,
        period: 1,
      },
      ...(options.deduplicationId
        ? { deduplicationId: options.deduplicationId }
        : {}),
      ...(options.delaySeconds && options.delaySeconds > 0
        ? { delay: options.delaySeconds }
        : {}),
    });
  }
}
