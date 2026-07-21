import { NotFoundError } from '../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import { resolveUniqueSlug } from '../../shared/utils/slug';
import { calculateReadMinutes, normalizeJournalBlocks } from './journal.helpers';
import type { IJournalRepository } from './journal.repository.interface';
import type {
  CreateJournalInput,
  Journal,
  JournalListFilter,
  JournalRepositoryUpdateInput,
  PublicJournalListFilter,
  UpdateJournalInput,
} from './journal.types';

export class JournalService {
  constructor(private readonly journalRepository: IJournalRepository) {}

  listPublished(
    filter: PublicJournalListFilter,
    pagination: Pagination,
  ): Promise<Paginated<Journal>> {
    return this.journalRepository.findPublished(filter, pagination);
  }

  async getPublishedBySlug(slug: string): Promise<Journal> {
    const journal = await this.journalRepository.findPublishedBySlug(slug);
    if (!journal) {
      throw new NotFoundError('Journal article not found');
    }
    return journal;
  }

  listJournals(
    filter: JournalListFilter,
    pagination: Pagination,
  ): Promise<Paginated<Journal>> {
    return this.journalRepository.findMany(filter, pagination);
  }

  async getJournalById(id: string): Promise<Journal> {
    const journal = await this.journalRepository.findById(id);
    if (!journal) {
      throw new NotFoundError('Journal article not found');
    }
    return journal;
  }

  async createJournal(input: CreateJournalInput): Promise<Journal> {
    const status = input.status ?? 'draft';
    const blocks = normalizeJournalBlocks(input.blocks ?? []);
    const featured = status === 'published' ? (input.featured ?? false) : false;
    const publishedAt =
      status === 'published'
        ? (input.publishedAt ?? new Date())
        : null;
    const readMinutes =
      input.readMinutes ?? calculateReadMinutes(input.excerpt, blocks);
    const slug = await this.resolveSlug(input.title);

    const created = await this.journalRepository.create({
      title: input.title,
      excerpt: input.excerpt,
      category: input.category,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      blocks,
      status,
      featured,
      readMinutes,
      publishedAt,
      slug,
    });

    if (created.featured) {
      await this.journalRepository.clearFeaturedExcept(created.id);
    }

    return created;
  }

  async updateJournal(id: string, input: UpdateJournalInput): Promise<Journal> {
    const existing = await this.getJournalById(id);
    const nextStatus = input.status ?? existing.status;
    const nextExcerpt = input.excerpt ?? existing.excerpt;
    const nextBlocks =
      input.blocks !== undefined
        ? normalizeJournalBlocks(input.blocks)
        : existing.blocks;

    const updatePayload: JournalRepositoryUpdateInput = { ...input };

    if (input.blocks !== undefined) {
      updatePayload.blocks = nextBlocks;
    }

    if (input.title) {
      updatePayload.slug = await this.resolveSlug(input.title, id);
    }

    if (nextStatus !== 'published') {
      updatePayload.featured = false;
      if (input.publishedAt === undefined) {
        updatePayload.publishedAt = null;
      }
    } else {
      updatePayload.featured = input.featured ?? existing.featured;
      if (input.publishedAt !== undefined) {
        updatePayload.publishedAt = input.publishedAt;
      } else if (!existing.publishedAt) {
        updatePayload.publishedAt = new Date();
      }
    }

    const shouldRecalculateReadMinutes =
      input.readMinutes === undefined &&
      (input.excerpt !== undefined || input.blocks !== undefined);

    if (shouldRecalculateReadMinutes) {
      updatePayload.readMinutes = calculateReadMinutes(nextExcerpt, nextBlocks);
    }

    const updated = await this.journalRepository.update(id, updatePayload);

    if (updated.featured) {
      await this.journalRepository.clearFeaturedExcept(updated.id);
    }

    return updated;
  }

  async deleteJournal(id: string): Promise<void> {
    await this.getJournalById(id);
    await this.journalRepository.delete(id);
  }

  private resolveSlug(title: string, excludeId?: string): Promise<string> {
    return resolveUniqueSlug(
      title,
      (candidate) => this.journalRepository.slugExists(candidate, excludeId),
      220,
    );
  }
}
