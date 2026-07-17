import type { EmailJob } from './email-job.types';

/** Delivers an already-queued email job through the configured provider. */
export interface IEmailDeliveryService {
  deliver(job: EmailJob): Promise<void>;
}
