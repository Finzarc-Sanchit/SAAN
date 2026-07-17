import type { IEmailService, OtpPurpose } from './email.interface';
import type { IEmailQueue } from './email-queue.interface';

/** Auth-facing adapter that converts transactional messages into queue jobs. */
export class QueuedEmailService implements IEmailService {
  constructor(private readonly emailQueue: IEmailQueue) {}

  async sendOtpEmail(to: string, otp: string, purpose: OtpPurpose): Promise<void> {
    await this.emailQueue.enqueue({ type: 'otp', to, otp, purpose });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    await this.emailQueue.enqueue({ type: 'password-reset', to, resetLink });
  }

  async sendPasswordChangedEmail(to: string): Promise<void> {
    await this.emailQueue.enqueue({ type: 'password-changed', to });
  }
}
