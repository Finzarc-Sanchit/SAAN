import type { INewsletterCampaignRepository } from '../../../../modules/newsletter/newsletter-campaign.repository.interface';
import type {
  CreateNewsletterCampaignInput,
  NewsletterCampaign,
  NewsletterCampaignStatus,
} from '../../../../modules/newsletter/newsletter.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { normalizePagination } from '../../../../shared/utils/pagination';
import {
  NewsletterCampaignModel,
  type NewsletterCampaignDocument,
} from '../models/newsletter-campaign.model';

function toDomain(doc: NewsletterCampaignDocument): NewsletterCampaign {
  return {
    id: doc._id.toString(),
    subject: doc.subject,
    preheader: doc.preheader,
    content: doc.content,
    status: doc.status,
    createdByAdminId: doc.createdByAdminId.toString(),
    recipientCount: doc.recipientCount,
    queuedCount: doc.queuedCount,
    failedCount: doc.failedCount,
    queuedAt: doc.queuedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoNewsletterCampaignRepository
  implements INewsletterCampaignRepository
{
  async create(
    input: CreateNewsletterCampaignInput,
  ): Promise<NewsletterCampaign> {
    const doc = await NewsletterCampaignModel.create({
      ...input,
      status: 'sending',
      queuedCount: 0,
      failedCount: 0,
      queuedAt: null,
    });
    return toDomain(doc.toObject() as NewsletterCampaignDocument);
  }

  async finalize(
    id: string,
    status: NewsletterCampaignStatus,
    queuedCount: number,
    failedCount: number,
  ): Promise<NewsletterCampaign> {
    const doc = await NewsletterCampaignModel.findByIdAndUpdate(
      id,
      {
        status,
        queuedCount,
        failedCount,
        queuedAt: queuedCount > 0 ? new Date() : null,
      },
      { new: true, runValidators: true },
    )
      .lean<NewsletterCampaignDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Newsletter campaign not found');
    }
    return toDomain(doc);
  }

  async findMany(
    pagination: Pagination,
  ): Promise<Paginated<NewsletterCampaign>> {
    const { page, limit, skip } = normalizePagination(pagination);
    const [docs, total] = await Promise.all([
      NewsletterCampaignModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<NewsletterCampaignDocument[]>()
        .exec(),
      NewsletterCampaignModel.countDocuments({}).exec(),
    ]);

    return { items: docs.map(toDomain), page, limit, total };
  }
}
