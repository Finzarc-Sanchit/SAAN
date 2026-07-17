import type { Paginated, Pagination } from '../../shared/types/pagination';
import type { INewsletterRepository } from './newsletter.repository.interface';
import type {
  NewsletterListFilter,
  NewsletterStatus,
  NewsletterSubscription,
  SubscribeNewsletterInput,
} from './newsletter.types';

/** Coordinates idempotent newsletter subscriptions and admin operations. */
export class NewsletterService {
  constructor(private readonly newsletterRepository: INewsletterRepository) {}

  async subscribe(input: SubscribeNewsletterInput): Promise<void> {
    await this.newsletterRepository.subscribe(
      input.email.trim().toLowerCase(),
      input.source ?? 'other',
    );
  }

  listSubscriptions(
    filter: NewsletterListFilter,
    pagination: Pagination,
  ): Promise<Paginated<NewsletterSubscription>> {
    return this.newsletterRepository.findMany(filter, pagination);
  }

  updateStatus(id: string, status: NewsletterStatus): Promise<NewsletterSubscription> {
    return this.newsletterRepository.updateStatus(id, status);
  }

  deleteSubscription(id: string): Promise<void> {
    return this.newsletterRepository.delete(id);
  }
}
