import { Types } from 'mongoose';
import type { IReviewRepository } from '../../../../modules/review/review.repository.interface';
import type {
  CreateReviewInput,
  Review,
  ReviewListOptions,
  ReviewListSort,
  UpdateReviewInput,
} from '../../../../modules/review/review.types';
import type { Paginated, Pagination } from '../../../../shared/types/pagination';
import { ConflictError } from '../../../../shared/errors/conflict-error';
import { NotFoundError } from '../../../../shared/errors/not-found-error';
import { isMongoDuplicateKeyError } from '../../../../shared/utils/mongo';
import { ReviewModel, type ReviewDocument } from '../models/review.model';

function toDomainReview(doc: ReviewDocument): Review {
  return {
    id: doc._id.toString(),
    productId: doc.productId.toString(),
    userId: doc.userId.toString(),
    rating: doc.rating,
    review: doc.review,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function buildSort(sort?: ReviewListSort): Record<string, 1 | -1> {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'rating_high':
      return { rating: -1, createdAt: -1 };
    case 'rating_low':
      return { rating: 1, createdAt: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

function toObjectId(id: string): Types.ObjectId | null {
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
}

export class MongoReviewRepository implements IReviewRepository {
  async findById(id: string): Promise<Review | null> {
    const objectId = toObjectId(id);
    if (!objectId) {
      return null;
    }

    const doc = await ReviewModel.findById(objectId).lean<ReviewDocument>().exec();
    return doc ? toDomainReview(doc) : null;
  }

  async findByProduct(
    productId: string,
    pagination: Pagination,
    options: ReviewListOptions = {},
  ): Promise<Paginated<Review>> {
    const productObjectId = toObjectId(productId);
    if (!productObjectId) {
      return {
        items: [],
        page: pagination.page,
        limit: pagination.limit,
        total: 0,
      };
    }

    const query = { productId: productObjectId };
    const skip = (pagination.page - 1) * pagination.limit;
    const sort = buildSort(options.sort);

    const [docs, total] = await Promise.all([
      ReviewModel.find(query).sort(sort).skip(skip).limit(pagination.limit).lean<ReviewDocument[]>().exec(),
      ReviewModel.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map(toDomainReview),
      page: pagination.page,
      limit: pagination.limit,
      total,
    };
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    const userObjectId = toObjectId(userId);
    const productObjectId = toObjectId(productId);

    if (!userObjectId || !productObjectId) {
      return null;
    }

    const doc = await ReviewModel.findOne({
      userId: userObjectId,
      productId: productObjectId,
    })
      .lean<ReviewDocument>()
      .exec();

    return doc ? toDomainReview(doc) : null;
  }

  async create(data: CreateReviewInput): Promise<Review> {
    const productObjectId = toObjectId(data.productId);
    const userObjectId = toObjectId(data.userId);

    if (!productObjectId || !userObjectId) {
      throw new NotFoundError('Product or user not found');
    }

    try {
      const doc = await ReviewModel.create({
        productId: productObjectId,
        userId: userObjectId,
        rating: data.rating,
        review: data.review,
      });

      return toDomainReview(doc.toObject() as ReviewDocument);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new ConflictError('You have already reviewed this product');
      }

      throw error;
    }
  }

  async update(id: string, data: UpdateReviewInput): Promise<Review> {
    const objectId = toObjectId(id);
    if (!objectId) {
      throw new NotFoundError('Review not found');
    }

    const doc = await ReviewModel.findByIdAndUpdate(objectId, data, {
      new: true,
      runValidators: true,
    })
      .lean<ReviewDocument>()
      .exec();

    if (!doc) {
      throw new NotFoundError('Review not found');
    }

    return toDomainReview(doc);
  }

  async delete(id: string): Promise<void> {
    const objectId = toObjectId(id);
    if (!objectId) {
      throw new NotFoundError('Review not found');
    }

    const doc = await ReviewModel.findByIdAndDelete(objectId).exec();
    if (!doc) {
      throw new NotFoundError('Review not found');
    }
  }

  async getAggregateForProduct(productId: string): Promise<{ average: number; count: number }> {
    const productObjectId = toObjectId(productId);
    if (!productObjectId) {
      return { average: 0, count: 0 };
    }

    const [result] = await ReviewModel.aggregate<{ average: number; count: number }>([
      { $match: { productId: productObjectId } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]).exec();

    if (!result) {
      return { average: 0, count: 0 };
    }

    return {
      average: result.average,
      count: result.count,
    };
  }
}
