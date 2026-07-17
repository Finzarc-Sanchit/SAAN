import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { INewsletterRepository } from './newsletter.repository.interface';
import { NewsletterService } from './newsletter.service';
import type { NewsletterSubscription } from './newsletter.types';

const subscription: NewsletterSubscription = {
  id: 'newsletter-1',
  email: 'reader@example.com',
  status: 'active',
  source: 'footer',
  subscribedAt: new Date('2026-07-17T10:00:00Z'),
  unsubscribedAt: null,
  createdAt: new Date('2026-07-17T10:00:00Z'),
  updatedAt: new Date('2026-07-17T10:00:00Z'),
};

function repositoryMock(): jest.Mocked<INewsletterRepository> {
  return {
    subscribe: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };
}

describe('NewsletterService', () => {
  let repository: jest.Mocked<INewsletterRepository>;
  let service: NewsletterService;

  beforeEach(() => {
    repository = repositoryMock();
    service = new NewsletterService(repository);
  });

  it('normalizes email and uses the default source', async () => {
    repository.subscribe.mockResolvedValue(subscription);

    await service.subscribe({ email: '  READER@EXAMPLE.COM ' });

    expect(repository.subscribe).toHaveBeenCalledWith('reader@example.com', 'other');
  });

  it('delegates idempotent subscription handling to the repository', async () => {
    repository.subscribe.mockResolvedValue(subscription);

    await expect(
      service.subscribe({ email: subscription.email, source: 'footer' }),
    ).resolves.toBeUndefined();
    expect(repository.subscribe).toHaveBeenCalledTimes(1);
  });

  it('returns paginated admin subscriptions', async () => {
    const result = {
      items: [subscription],
      page: 1,
      limit: 20,
      total: 1,
    };
    repository.findMany.mockResolvedValue(result);

    await expect(
      service.listSubscriptions({ status: 'active', search: 'reader' }, { page: 1, limit: 20 }),
    ).resolves.toEqual(result);
  });

  it('delegates status changes and deletion', async () => {
    const unsubscribed = {
      ...subscription,
      status: 'unsubscribed' as const,
      unsubscribedAt: new Date('2026-07-18T10:00:00Z'),
    };
    repository.updateStatus.mockResolvedValue(unsubscribed);
    repository.delete.mockResolvedValue();

    await expect(service.updateStatus(subscription.id, 'unsubscribed')).resolves.toEqual(
      unsubscribed,
    );
    await expect(service.deleteSubscription(subscription.id)).resolves.toBeUndefined();
  });
});
