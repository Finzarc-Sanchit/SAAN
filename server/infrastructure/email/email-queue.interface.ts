import type { EmailJob } from './email-job.types';

export type EmailQueueOptions = {
  deduplicationId?: string;
  /** Delay delivery by this many seconds (used for appointment reminders). */
  delaySeconds?: number;
};

/** Durably schedules transactional email without waiting for SMTP delivery. */
export interface IEmailQueue {
  enqueue(job: EmailJob, options?: EmailQueueOptions): Promise<void>;
}
