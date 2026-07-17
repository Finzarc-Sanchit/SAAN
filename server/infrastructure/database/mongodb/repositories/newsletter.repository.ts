import { Types } from 'mongoose';
import type { INewsletterRepository } from '../../../../modules/newsletter/newsletter.repository.interface';
import type {
  NewsletterListFilter,
  NewsletterSource,
  NewsletterStatus,
  NewsletterSubscription,
} from '../../../../modules/newsletter/newsletter.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { isMongoDuplicateKeyError } from '../../../../shared/utils/mongo';
import { normalizePagination } from '../../../../shared/utils/pagination';
import { NewsletterModel, type NewsletterDocument } from '../models/newsletter.model';

function toDomainSubscription(doc: NewsletterDocument): NewsletterSubscription {
  return {
    id: doc._id.toString(),
    email: doc.email,
    status: doc.status,
    source: doc.source,
    subscribedAt: doc.subscribedAt,
    unsubscribedAt: doc.unsubscribedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findByEmail(email: string): Promise<NewsletterDocument | null> {
  return NewsletterModel.findOne({ email }).lean<NewsletterDocument>().exec();
}

async function reactivate(
  email: string,
  source: NewsletterSource,
): Promise<NewsletterDocument | null> {
  const now = new Date();
  return NewsletterModel.findOneAndUpdate(
    { email, status: 'unsubscribed' },
    {
      status: 'active',
      source,
      subscribedAt: now,
      unsubscribedAt: null,
    },
    { new: true, runValidators: true },
  )
    .lean<NewsletterDocument>()
    .exec();
}

export class MongoNewsletterRepository implements INewsletterRepository {
  async subscribe(email: string, source: NewsletterSource): Promise<NewsletterSubscription> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await findByEmail(normalizedEmail);

    if (existing?.status === 'active') {
      return toDomainSubscription(existing);
    }
    if (existing) {
      const reactivated = await reactivate(normalizedEmail, source);
      if (reactivated) {
        return toDomainSubscription(reactivated);
      }
    }

    try {
      const doc = await NewsletterModel.create({
        email: normalizedEmail,
        status: 'active',
        source,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      });
      return toDomainSubscription(doc.toObject() as NewsletterDocument);
    } catch (error: unknown) {
      if (!isMongoDuplicateKeyError(error)) {
        throw error;
      }

      const reactivated = await reactivate(normalizedEmail, source);
      const racedSubscription = reactivated ?? (await findByEmail(normalizedEmail));
      if (racedSubscription) {
        return toDomainSubscription(racedSubscription);
      }
      throw error;
    }
  }

  async findMany(
    filter: NewsletterListFilter,
    pagination: Pagination,
  ): Promise<Paginated<NewsletterSubscription>> {
    const { page, limit, skip } = normalizePagination(pagination);
    const query: Record<string, unknown> = {};
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.search) {
      query.email = new RegExp(escapeRegex(filter.search.trim()), 'i');
    }

    const [docs, total] = await Promise.all([
      NewsletterModel.find(query)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<NewsletterDocument[]>()
        .exec(),
      NewsletterModel.countDocuments(query).exec(),
    ]);
    return { items: docs.map(toDomainSubscription), page, limit, total };
  }

  async updateStatus(id: string, status: NewsletterStatus): Promise<NewsletterSubscription> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Newsletter subscription not found');
    }
    const now = new Date();
    const statusDates =
      status === 'active' ? { subscribedAt: now, unsubscribedAt: null } : { unsubscribedAt: now };
    const doc = await NewsletterModel.findByIdAndUpdate(
      id,
      { status, ...statusDates },
      { new: true, runValidators: true },
    )
      .lean<NewsletterDocument>()
      .exec();
    if (!doc) {
      throw new NotFoundError('Newsletter subscription not found');
    }
    return toDomainSubscription(doc);
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Newsletter subscription not found');
    }
    const doc = await NewsletterModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundError('Newsletter subscription not found');
    }
  }
}
