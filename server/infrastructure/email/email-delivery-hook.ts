import type { EmailJob } from './email-job.types';

export type EmailDeliveryDecision = 'proceed' | 'skip';

/** Optional hooks for feature modules that need to gate or acknowledge email delivery. */
export interface IEmailDeliveryHook {
  beforeDeliver?(job: EmailJob): Promise<EmailDeliveryDecision>;
  afterDeliver?(job: EmailJob): Promise<void>;
}

const hooks: IEmailDeliveryHook[] = [];

export function registerEmailDeliveryHook(hook: IEmailDeliveryHook): void {
  hooks.push(hook);
}

export function getEmailDeliveryHooks(): readonly IEmailDeliveryHook[] {
  return hooks;
}

/** Test helper — clears registered hooks between suites. */
export function clearEmailDeliveryHooks(): void {
  hooks.length = 0;
}
