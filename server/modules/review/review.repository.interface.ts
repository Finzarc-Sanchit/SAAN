import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  CreateReviewInput,
  Review,
  ReviewListOptions,
  UpdateReviewInput,
} from './review.types';

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  findByProduct(
    productId: string,
    pagination: Pagination,
    options?: ReviewListOptions,
  ): Promise<Paginated<Review>>;
  findByUserAndProduct(userId: string, productId: string): Promise<Review | null>;
  create(data: CreateReviewInput): Promise<Review>;
  update(id: string, data: UpdateReviewInput): Promise<Review>;
  delete(id: string): Promise<void>;
  getAggregateForProduct(productId: string): Promise<{ average: number; count: number }>;
}
