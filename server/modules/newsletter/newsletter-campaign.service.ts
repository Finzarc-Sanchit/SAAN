import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { ConflictError } from '../../shared/errors/conflict-error';
import type { Pagination } from '../../shared/types/pagination';
import type { INewsletterCampaignRepository } from './newsletter-campaign.repository.interface';
import type { INewsletterRepository } from './newsletter.repository.interface';
import type {
  NewsletterCampaign,
  NewsletterSubscription,
} from './newsletter.types';

const SUBSCRIBER_BATCH_SIZE = 100;
const QUEUE_CONCURRENCY = 10;

export type SendNewsletterCampaignInput = {
  subject: string;
  preheader?: string;
  content: string;
};

export class NewsletterCampaignService {
  constructor(
    private readonly subscriptionRepository: INewsletterRepository,
    private readonly campaignRepository: INewsletterCampaignRepository,
    private readonly emailQueue: IEmailQueue,
  ) {}

  async send(
    adminId: string,
    input: SendNewsletterCampaignInput,
  ): Promise<NewsletterCampaign> {
    const subscribers = await this.getActiveSubscribers();
    if (subscribers.length === 0) {
      throw new ConflictError('There are no active newsletter subscribers');
    }

    const campaign = await this.campaignRepository.create({
      subject: input.subject.trim(),
      preheader: input.preheader?.trim() || null,
      content: input.content.trim(),
      createdByAdminId: adminId,
      recipientCount: subscribers.length,
    });

    let queuedCount = 0;
    let failedCount = 0;

    for (let index = 0; index < subscribers.length; index += QUEUE_CONCURRENCY) {
      const batch = subscribers.slice(index, index + QUEUE_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((subscriber) =>
          this.emailQueue.enqueue(
            {
              type: 'newsletter',
              campaignId: campaign.id,
              subscriptionId: subscriber.id,
              to: subscriber.email,
              subject: campaign.subject,
              preheader: campaign.preheader ?? undefined,
              content: campaign.content,
            },
            {
              deduplicationId: `newsletter-${campaign.id}-${subscriber.id}`,
            },
          ),
        ),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          queuedCount += 1;
        } else {
          failedCount += 1;
        }
      }
    }

    const status =
      queuedCount === subscribers.length
        ? 'queued'
        : queuedCount > 0
          ? 'partially_failed'
          : 'failed';

    return this.campaignRepository.finalize(
      campaign.id,
      status,
      queuedCount,
      failedCount,
    );
  }

  list(pagination: Pagination) {
    return this.campaignRepository.findMany(pagination);
  }

  private async getActiveSubscribers(): Promise<NewsletterSubscription[]> {
    const subscribers: NewsletterSubscription[] = [];
    let page = 1;
    let total = 0;

    do {
      const result = await this.subscriptionRepository.findMany(
        { status: 'active' },
        { page, limit: SUBSCRIBER_BATCH_SIZE },
      );
      subscribers.push(...result.items);
      total = result.total;
      page += 1;
    } while (subscribers.length < total);

    return subscribers;
  }
}
