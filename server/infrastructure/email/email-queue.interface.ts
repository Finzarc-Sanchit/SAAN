import type { EmailJob } from './email-job.types';

export type EmailQueueOptions = {
  deduplicationId?: string;
};

/** Durably schedules transactional email without waiting for SMTP delivery. */
export interface IEmailQueue {
  enqueue(job: EmailJob, options?: EmailQueueOptions): Promise<void>;
}
