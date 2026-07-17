import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  CreateNewsletterCampaignInput,
  NewsletterCampaign,
  NewsletterCampaignStatus,
} from './newsletter.types';

export interface INewsletterCampaignRepository {
  create(
    input: CreateNewsletterCampaignInput,
  ): Promise<NewsletterCampaign>;
  finalize(
    id: string,
    status: NewsletterCampaignStatus,
    queuedCount: number,
    failedCount: number,
  ): Promise<NewsletterCampaign>;
  findMany(pagination: Pagination): Promise<Paginated<NewsletterCampaign>>;
}
