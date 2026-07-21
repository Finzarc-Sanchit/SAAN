import { Types } from 'mongoose';
import type { IJournalRepository } from '../../../../modules/journal/journal.repository.interface';
import type {
  Journal,
  JournalContentBlock,
  JournalListFilter,
  JournalRepositoryCreateInput,
  JournalRepositoryUpdateInput,
  PublicJournalListFilter,
} from '../../../../modules/journal/journal.types';
import { ConflictError } from '../../../../shared/errors/conflict-error';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { isMongoDuplicateKeyError } from '../../../../shared/utils/mongo';
import { normalizePagination } from '../../../../shared/utils/pagination';
import { JournalModel, type JournalDocument } from '../models/journal.model';

function toDomainBlocks(blocks: JournalDocument['blocks']): JournalContentBlock[] {
  return blocks.map((block) => ({
    type: block.type,
    ...(block.value !== undefined ? { value: block.value } : {}),
    ...(block.level !== undefined ? { level: block.level } : {}),
    ...(block.src !== undefined ? { src: block.src } : {}),
    ...(block.alt !== undefined ? { alt: block.alt } : {}),
    ...(block.caption !== undefined ? { caption: block.caption } : {}),
  }));
}

function toDomainJournal(doc: JournalDocument): Journal {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    imageUrl: doc.imageUrl,
    imageAlt: doc.imageAlt,
    blocks: toDomainBlocks(doc.blocks ?? []),
    status: doc.status,
    featured: doc.featured,
    readMinutes: doc.readMinutes,
    publishedAt: doc.publishedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function throwSlugConflict(error: unknown, slug: string): never {
  if (isMongoDuplicateKeyError(error)) {
    throw new ConflictError(`Journal slug "${slug}" is already in use`);
  }
  throw error;
}

function buildPublicQuery(filter: PublicJournalListFilter): Record<string, unknown> {
  const query: Record<string, unknown> = { status: 'published' };
  if (filter.category) {
    query.category = filter.category;
  }
  if (filter.featured !== undefined) {
    query.featured = filter.featured;
  }
  return query;
}

function buildAdminQuery(filter: JournalListFilter): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (filter.status) {
    query.status = filter.status;
  }
  if (filter.category) {
    query.category = filter.category;
  }
  if (filter.featured !== undefined) {
    query.featured = filter.featured;
  }
  if (filter.search) {
    const search = new RegExp(escapeRegex(filter.search.trim()), 'i');
    query.$or = [{ title: search }, { excerpt: search }, { slug: search }];
  }
  return query;
}

export class MongoJournalRepository implements IJournalRepository {
  async findById(id: string): Promise<Journal | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await JournalModel.findById(id).lean<JournalDocument>().exec();
    return doc ? toDomainJournal(doc) : null;
  }

  async findPublishedBySlug(slug: string): Promise<Journal | null> {
    const doc = await JournalModel.findOne({
      slug: normalizeSlug(slug),
      status: 'published',
    })
      .lean<JournalDocument>()
      .exec();
    return doc ? toDomainJournal(doc) : null;
  }

  async findPublished(
    filter: PublicJournalListFilter,
    pagination: Pagination,
  ): Promise<Paginated<Journal>> {
    const { page, limit, skip } = normalizePagination(pagination);
    const query = buildPublicQuery(filter);
    const [docs, total] = await Promise.all([
      JournalModel.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<JournalDocument[]>()
        .exec(),
      JournalModel.countDocuments(query).exec(),
    ]);
    return { items: docs.map(toDomainJournal), page, limit, total };
  }

  async findMany(
    filter: JournalListFilter,
    pagination: Pagination,
  ): Promise<Paginated<Journal>> {
    const { page, limit, skip } = normalizePagination(pagination);
    const query = buildAdminQuery(filter);
    const [docs, total] = await Promise.all([
      JournalModel.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<JournalDocument[]>()
        .exec(),
      JournalModel.countDocuments(query).exec(),
    ]);
    return { items: docs.map(toDomainJournal), page, limit, total };
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { slug: normalizeSlug(slug) };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await JournalModel.countDocuments(query).exec()) > 0;
  }

  async create(data: JournalRepositoryCreateInput): Promise<Journal> {
    try {
      const doc = await JournalModel.create({
        ...data,
        slug: normalizeSlug(data.slug),
      });
      return toDomainJournal(doc.toObject() as JournalDocument);
    } catch (error: unknown) {
      throwSlugConflict(error, data.slug);
    }
  }

  async update(id: string, data: JournalRepositoryUpdateInput): Promise<Journal> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Journal article not found');
    }

    const updatePayload: JournalRepositoryUpdateInput = { ...data };
    if (data.slug !== undefined) {
      updatePayload.slug = normalizeSlug(data.slug);
    }

    try {
      const doc = await JournalModel.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
        .lean<JournalDocument>()
        .exec();
      if (!doc) {
        throw new NotFoundError('Journal article not found');
      }
      return toDomainJournal(doc);
    } catch (error: unknown) {
      throwSlugConflict(error, data.slug ?? 'requested');
    }
  }

  async clearFeaturedExcept(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      return;
    }
    await JournalModel.updateMany(
      {
        _id: { $ne: new Types.ObjectId(id) },
        status: 'published',
        featured: true,
      },
      { $set: { featured: false } },
    ).exec();
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Journal article not found');
    }
    const result = await JournalModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundError('Journal article not found');
    }
  }
}
