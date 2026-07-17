import { describe, expect, it, jest } from '@jest/globals';
import type { IEmailQueue } from './email-queue.interface';
import { QueuedEmailService } from './queued-email.service';

describe('QueuedEmailService', () => {
  it('converts auth emails into queue jobs', async () => {
    const queue: jest.Mocked<IEmailQueue> = {
      enqueue: jest.fn<IEmailQueue['enqueue']>().mockResolvedValue(undefined),
    };
    const service = new QueuedEmailService(queue);

    await service.sendOtpEmail('customer@example.com', '123456', 'registration');
    await service.sendPasswordResetEmail(
      'customer@example.com',
      'https://saan.example/reset-password?token=value',
    );
    await service.sendPasswordChangedEmail('customer@example.com');

    expect(queue.enqueue).toHaveBeenNthCalledWith(1, {
      type: 'otp',
      to: 'customer@example.com',
      otp: '123456',
      purpose: 'registration',
    });
    expect(queue.enqueue).toHaveBeenNthCalledWith(2, {
      type: 'password-reset',
      to: 'customer@example.com',
      resetLink: 'https://saan.example/reset-password?token=value',
    });
    expect(queue.enqueue).toHaveBeenNthCalledWith(3, {
      type: 'password-changed',
      to: 'customer@example.com',
    });
  });
});
