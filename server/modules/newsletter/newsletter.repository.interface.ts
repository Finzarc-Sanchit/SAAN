import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  NewsletterListFilter,
  NewsletterSource,
  NewsletterStatus,
  NewsletterSubscription,
} from './newsletter.types';

/** Persistence contract for newsletter subscriptions. */
export interface INewsletterRepository {
  subscribe(email: string, source: NewsletterSource): Promise<NewsletterSubscription>;
  findMany(
    filter: NewsletterListFilter,
    pagination: Pagination,
  ): Promise<Paginated<NewsletterSubscription>>;
  updateStatus(id: string, status: NewsletterStatus): Promise<NewsletterSubscription>;
  delete(id: string): Promise<void>;
}
