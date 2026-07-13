import { Types } from 'mongoose';
import type { IDiscountRepository } from '../../../../modules/discount/discount.repository.interface';
import type {
  CreateDiscountInput,
  Discount,
  UpdateDiscountInput,
} from '../../../../modules/discount/discount.types';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { DiscountModel, type DiscountDocument } from '../models/discount.model';

function toDomainDiscount(doc: DiscountDocument): Discount {
  return {
    id: doc._id.toString(),
    type: doc.type,
    value: doc.value,
    validFrom: doc.validFrom,
    validTo: doc.validTo,
  };
}

export class MongoDiscountRepository implements IDiscountRepository {
  async findById(id: string): Promise<Discount | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const doc = await DiscountModel.findById(id).lean<DiscountDocument>().exec();
    return doc ? toDomainDiscount(doc) : null;
  }

  async findMany(): Promise<Discount[]> {
    const docs = await DiscountModel.find().sort({ validFrom: -1 }).lean<DiscountDocument[]>().exec();
    return docs.map(toDomainDiscount);
  }

  async create(data: CreateDiscountInput): Promise<Discount> {
    const doc = await DiscountModel.create(data);
    return toDomainDiscount(doc.toObject() as DiscountDocument);
  }

  async update(id: string, data: UpdateDiscountInput): Promise<Discount> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Discount not found');
    }

    const doc = await DiscountModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .lean<DiscountDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Discount not found');
    }

    return toDomainDiscount(doc);
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundError('Discount not found');
    }

    const doc = await DiscountModel.findByIdAndDelete(id).exec();
    if (!doc) {
      throw new NotFoundError('Discount not found');
    }
  }
}
