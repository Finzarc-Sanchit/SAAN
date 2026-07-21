import { Receiver } from '@upstash/qstash';
import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error';
import { ValidationError } from '../../shared/errors/validation-error';
import { successResponse } from '../../shared/utils/response';
import { getEmailDeliveryHooks } from './email-delivery-hook';
import type { IEmailDeliveryService } from './email-delivery.interface';
import { emailJobSchema } from './email-job.types';

function createReceiver(): Receiver | null {
  if (!env.QSTASH_CURRENT_SIGNING_KEY || !env.QSTASH_NEXT_SIGNING_KEY) {
    return null;
  }
  return new Receiver({
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
  });
}

export class EmailJobController {
  private readonly receiver = createReceiver();

  constructor(private readonly deliveryService: IEmailDeliveryService) {}

  process = async (req: Request, res: Response): Promise<void> => {
    const rawBody = typeof req.body === 'string' ? req.body : '';
    await this.assertAuthenticRequest(rawBody, req.get('upstash-signature'));

    let unknownJob: unknown;
    try {
      unknownJob = JSON.parse(rawBody);
    } catch {
      throw new ValidationError('Invalid email job payload');
    }

    const parsed = emailJobSchema.safeParse(unknownJob);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid email job payload',
        parsed.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
        })),
      );
    }

    const job = parsed.data;
    const hooks = getEmailDeliveryHooks();

    for (const hook of hooks) {
      if (!hook.beforeDeliver) continue;
      const decision = await hook.beforeDeliver(job);
      if (decision === 'skip') {
        res.status(200).json(successResponse({ processed: true, skipped: true }));
        return;
      }
    }

    await this.deliveryService.deliver(job);

    for (const hook of hooks) {
      if (hook.afterDeliver) {
        await hook.afterDeliver(job);
      }
    }

    res.status(200).json(successResponse({ processed: true }));
  };

  private async assertAuthenticRequest(rawBody: string, signature?: string): Promise<void> {
    if (
      env.EMAIL_QUEUE_DRIVER !== 'qstash' ||
      !this.receiver ||
      !signature ||
      !env.SERVER_PUBLIC_URL
    ) {
      throw new UnauthorizedError('Invalid email job signature');
    }

    const url = new URL('/api/v1/internal/email-jobs', env.SERVER_PUBLIC_URL).toString();
    try {
      const isValid = await this.receiver.verify({ body: rawBody, signature, url });
      if (!isValid) {
        throw new UnauthorizedError('Invalid email job signature');
      }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid email job signature');
    }
  }
}
