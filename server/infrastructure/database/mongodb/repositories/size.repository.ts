import { Types } from 'mongoose';
import type { ISizeRepository } from '../../../../modules/size/size.repository.interface';
import type { CreateSizeInput, GarmentSize, UpdateSizeInput } from '../../../../modules/size/size.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { SizeModel, type SizeDocument } from '../models/size.model';
import { ProductModel } from '../models/product.model';

function toDomainSize(doc: SizeDocument): GarmentSize {
  return {
    id: doc._id.toString(),
    sizeId: doc.sizeId,
    label: doc.label,
    sortOrder: doc.sortOrder,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function normalizeLabel(label: string): string {
  return label.trim().toUpperCase();
}

export class MongoSizeRepository implements ISizeRepository {
  async findById(id: string): Promise<GarmentSize | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await SizeModel.findById(id).lean<SizeDocument>().exec();
    return doc ? toDomainSize(doc) : null;
  }

  async findBySizeId(sizeId: string): Promise<GarmentSize | null> {
    const doc = await SizeModel.findOne({ sizeId }).lean<SizeDocument>().exec();
    return doc ? toDomainSize(doc) : null;
  }

  async findByLabel(label: string): Promise<GarmentSize | null> {
    const doc = await SizeModel.findOne({ label: normalizeLabel(label) }).lean<SizeDocument>().exec();
    return doc ? toDomainSize(doc) : null;
  }

  async findMany(): Promise<GarmentSize[]> {
    const docs = await SizeModel.find().sort({ sortOrder: 1, label: 1 }).lean<SizeDocument[]>().exec();
    return docs.map(toDomainSize);
  }

  async findBySizeIds(sizeIds: string[]): Promise<GarmentSize[]> {
    if (sizeIds.length === 0) {
      return [];
    }

    const docs = await SizeModel.find({ sizeId: { $in: sizeIds } }).lean<SizeDocument[]>().exec();
    return docs.map(toDomainSize);
  }

  async create(data: CreateSizeInput & { sizeId: string }): Promise<GarmentSize> {
    const doc = await SizeModel.create({
      sizeId: data.sizeId,
      label: normalizeLabel(data.label),
      sortOrder: data.sortOrder ?? 0,
    });

    return toDomainSize(doc.toObject() as SizeDocument);
  }

  async update(id: string, data: UpdateSizeInput): Promise<GarmentSize> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Size not found');
    }

    const updatePayload: Record<string, unknown> = { ...data };
    if (data.label) {
      updatePayload.label = normalizeLabel(data.label);
    }

    const doc = await SizeModel.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })
      .lean<SizeDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Size not found');
    }

    return toDomainSize(doc);
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Size not found');
    }

    const doc = await SizeModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundError('Size not found');
    }
  }

  async sizeIdExists(sizeId: string): Promise<boolean> {
    const count = await SizeModel.countDocuments({ sizeId }).exec();
    return count > 0;
  }

  async labelExists(label: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { label: normalizeLabel(label) };

    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const count = await SizeModel.countDocuments(query).exec();
    return count > 0;
  }

  async isSizeInUse(sizeId: string): Promise<boolean> {
    const count = await ProductModel.countDocuments({ 'sizes.sizeId': sizeId }).exec();
    return count > 0;
  }
}
