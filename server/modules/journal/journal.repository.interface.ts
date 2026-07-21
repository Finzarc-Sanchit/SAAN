import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  Journal,
  JournalListFilter,
  JournalRepositoryCreateInput,
  JournalRepositoryUpdateInput,
  PublicJournalListFilter,
} from './journal.types';

export interface IJournalRepository {
  findById(id: string): Promise<Journal | null>;
  findPublishedBySlug(slug: string): Promise<Journal | null>;
  findPublished(
    filter: PublicJournalListFilter,
    pagination: Pagination,
  ): Promise<Paginated<Journal>>;
  findMany(filter: JournalListFilter, pagination: Pagination): Promise<Paginated<Journal>>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  create(data: JournalRepositoryCreateInput): Promise<Journal>;
  update(id: string, data: JournalRepositoryUpdateInput): Promise<Journal>;
  clearFeaturedExcept(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
