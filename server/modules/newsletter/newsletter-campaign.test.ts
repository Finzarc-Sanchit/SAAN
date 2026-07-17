import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { ConflictError } from '../../shared/errors/conflict-error';
import type { INewsletterCampaignRepository } from './newsletter-campaign.repository.interface';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import type { INewsletterRepository } from './newsletter.repository.interface';
import type {
  NewsletterCampaign,
  NewsletterSubscription,
} from './newsletter.types';

const subscription: NewsletterSubscription = {
  id: 'subscription-1',
  email: 'reader@example.com',
  status: 'active',
  source: 'footer',
  subscribedAt: new Date('2026-01-01'),
  unsubscribedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const campaign: NewsletterCampaign = {
  id: 'campaign-1',
  subject: 'New collection',
  preheader: null,
  content: 'Discover the new collection.',
  status: 'sending',
  createdByAdminId: 'admin-1',
  recipientCount: 1,
  queuedCount: 0,
  failedCount: 0,
  queuedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('NewsletterCampaignService.send', () => {
  let subscriptions: jest.Mocked<INewsletterRepository>;
  let campaigns: jest.Mocked<INewsletterCampaignRepository>;
  let emailQueue: jest.Mocked<IEmailQueue>;
  let service: NewsletterCampaignService;

  beforeEach(() => {
    subscriptions = {
      subscribe: jest.fn(),
      findMany: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };
    campaigns = {
      create: jest.fn(),
      finalize: jest.fn(),
      findMany: jest.fn(),
    };
    emailQueue = { enqueue: jest.fn() };
    service = new NewsletterCampaignService(
      subscriptions,
      campaigns,
      emailQueue,
    );
  });

  it('queues one private email per active subscriber and records history', async () => {
    subscriptions.findMany.mockResolvedValue({
      items: [subscription],
      page: 1,
      limit: 100,
      total: 1,
    });
    campaigns.create.mockResolvedValue(campaign);
    campaigns.finalize.mockResolvedValue({
      ...campaign,
      status: 'queued',
      queuedCount: 1,
      queuedAt: new Date('2026-01-01'),
    });
    emailQueue.enqueue.mockResolvedValue();

    const result = await service.send('admin-1', {
      subject: 'New collection',
      content: 'Discover the new collection.',
    });

    expect(emailQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'newsletter',
        to: subscription.email,
        campaignId: campaign.id,
      }),
      { deduplicationId: 'newsletter-campaign-1-subscription-1' },
    );
    expect(campaigns.finalize).toHaveBeenCalledWith(
      campaign.id,
      'queued',
      1,
      0,
    );
    expect(result.status).toBe('queued');
  });

  it('rejects sending when there are no active subscribers', async () => {
    subscriptions.findMany.mockResolvedValue({
      items: [],
      page: 1,
      limit: 100,
      total: 0,
    });

    await expect(
      service.send('admin-1', {
        subject: 'New collection',
        content: 'Discover the new collection.',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(campaigns.create).not.toHaveBeenCalled();
    expect(emailQueue.enqueue).not.toHaveBeenCalled();
  });
});
