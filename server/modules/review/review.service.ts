import { logger } from '../../middlewares/request-logger';
import { USER_ROLES, type UserRole } from '../../shared/constants';
import { ConflictError } from '../../shared/errors/conflict-error';
import { ForbiddenError } from '../../shared/errors/forbidden-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import { sanitizePlainText } from '../../shared/utils/sanitize';
import type { IProductRepository } from '../product/product.repository.interface';
import type { IReviewRepository } from './review.repository.interface';
import type {
  CreateReviewInput,
  Review,
  ReviewListOptions,
  UpdateReviewInput,
} from './review.types';

type CreateReviewPayload = Omit<CreateReviewInput, 'productId' | 'userId'>;

export class ReviewService {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async listReviewsByProduct(
    productId: string,
    pagination: Pagination,
    options: ReviewListOptions = {},
  ): Promise<Paginated<Review>> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return this.reviewRepository.findByProduct(productId, pagination, options);
  }

  async createReview(
    userId: string,
    productId: string,
    input: CreateReviewPayload,
  ): Promise<Review> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const existing = await this.reviewRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      throw new ConflictError('You have already reviewed this product');
    }

    const review = await this.reviewRepository.create({
      productId,
      userId,
      rating: input.rating,
      review: sanitizePlainText(input.review),
    });

    await this.syncProductRatings(productId);

    return review;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    role: UserRole,
    input: UpdateReviewInput,
  ): Promise<Review> {
    const existing = await this.reviewRepository.findById(reviewId);
    if (!existing) {
      throw new NotFoundError('Review not found');
    }

    this.assertCanModifyReview(existing, userId, role);

    const updatePayload: UpdateReviewInput = {};

    if (input.rating !== undefined) {
      updatePayload.rating = input.rating;
    }

    if (input.review !== undefined) {
      updatePayload.review = sanitizePlainText(input.review);
    }

    const updated = await this.reviewRepository.update(reviewId, updatePayload);
    await this.syncProductRatings(existing.productId);

    return updated;
  }

  async deleteReview(reviewId: string, userId: string, role: UserRole): Promise<void> {
    const existing = await this.reviewRepository.findById(reviewId);
    if (!existing) {
      throw new NotFoundError('Review not found');
    }

    this.assertCanModifyReview(existing, userId, role);

    const { productId } = existing;
    await this.reviewRepository.delete(reviewId);
    await this.syncProductRatings(productId);
  }

  private assertCanModifyReview(review: Review, userId: string, role: UserRole): void {
    if (role === USER_ROLES.ADMIN) {
      return;
    }

    if (review.userId !== userId) {
      throw new ForbiddenError('You can only modify your own reviews');
    }
  }

  private async syncProductRatings(productId: string): Promise<void> {
    try {
      const { average, count } = await this.reviewRepository.getAggregateForProduct(productId);
      const ratingsAverage = count > 0 ? Math.round(average * 10) / 10 : 0;

      await this.productRepository.updateRatings(productId, {
        ratingsAverage,
        ratingsCount: count,
      });
    } catch (error) {
      logger.error(
        { err: error, productId },
        'Failed to sync product ratings after review change — review write succeeded but product aggregate may be stale',
      );
    }
  }
}
