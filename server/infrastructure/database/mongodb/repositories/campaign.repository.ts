import { Types } from 'mongoose';
import type { ICampaignRepository } from '../../../../modules/campaign/campaign.repository.interface';
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '../../../../modules/campaign/campaign.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { CampaignModel, type CampaignDocument } from '../models/campaign.model';

type LegacyCampaignDocument = CampaignDocument & {
  imageUrl?: string;
  imageAlt?: string;
};

function toDomainCampaign(doc: LegacyCampaignDocument): Campaign {
  return {
    id: doc._id.toString(),
    productId: doc.productId.toString(),
    desktopImageUrl: doc.desktopImageUrl ?? doc.imageUrl ?? '',
    desktopImageAlt: doc.desktopImageAlt ?? doc.imageAlt ?? '',
    mobileImageUrl: doc.mobileImageUrl ?? doc.imageUrl ?? '',
    mobileImageAlt: doc.mobileImageAlt ?? doc.imageAlt ?? '',
    startDate: doc.startDate,
    endDate: doc.endDate,
    priority: doc.priority,
    active: doc.active,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoCampaignRepository implements ICampaignRepository {
  async findById(id: string): Promise<Campaign | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await CampaignModel.findById(id).lean<LegacyCampaignDocument>().exec();
    return doc ? toDomainCampaign(doc) : null;
  }

  async findMany(): Promise<Campaign[]> {
    const docs = await CampaignModel.find()
      .sort({ priority: 1, createdAt: -1 })
      .lean<LegacyCampaignDocument[]>()
      .exec();
    return docs.map(toDomainCampaign);
  }

  async findActive(now: Date): Promise<Campaign[]> {
    const docs = await CampaignModel.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gt: now },
    })
      .sort({ priority: 1 })
      .lean<LegacyCampaignDocument[]>()
      .exec();

    return docs.map(toDomainCampaign);
  }

  async create(data: CreateCampaignInput): Promise<Campaign> {
    if (!Types.ObjectId.isValid(data.productId)) {
      throw new NotFoundError('Product not found');
    }

    const doc = await CampaignModel.create({
      productId: new Types.ObjectId(data.productId),
      desktopImageUrl: data.desktopImageUrl,
      desktopImageAlt: data.desktopImageAlt,
      mobileImageUrl: data.mobileImageUrl,
      mobileImageAlt: data.mobileImageAlt,
      startDate: data.startDate,
      endDate: data.endDate,
      priority: data.priority,
      active: data.active ?? true,
    });

    return toDomainCampaign(doc.toObject() as LegacyCampaignDocument);
  }

  async update(id: string, data: UpdateCampaignInput): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Campaign not found');
    }

    const updatePayload: Record<string, unknown> = { ...data };
    if (data.productId !== undefined) {
      if (!Types.ObjectId.isValid(data.productId)) {
        throw new NotFoundError('Product not found');
      }
      updatePayload.productId = new Types.ObjectId(data.productId);
    }

    const doc = await CampaignModel.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })
      .lean<LegacyCampaignDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Campaign not found');
    }

    return toDomainCampaign(doc);
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Campaign not found');
    }

    const result = await CampaignModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundError('Campaign not found');
    }
  }
}
