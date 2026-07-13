import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictError } from '../../shared/errors/conflict-error';
import { ForbiddenError } from '../../shared/errors/forbidden-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { USER_ROLES } from '../../shared/constants';
import type { IProductRepository } from '../product/product.repository.interface';
import type { Product } from '../product/product.types';
import type { IReviewRepository } from './review.repository.interface';
import { ReviewService } from './review.service';
import type { Review } from './review.types';

const baseProduct: Product = {
  id: 'product-1',
  categoryId: 'cat-1',
  discountId: null,
  name: 'Linen Shirt',
  slug: 'linen-shirt',
  description: 'A linen shirt',
  shortDescription: 'Linen shirt',
  fabric: 'Linen',
  basePrice: 5000,
  ratingsAverage: 0,
  ratingsCount: 0,
  stock: 10,
  status: 'active',
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  sizes: [
    {
      sizeId: 'size-1',
      size: 'M',
      quantity: 10,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
  ],
  images: [
    {
      imageId: 'image-1',
      imageUrl: 'https://example.com/shirt.jpg',
      sortOrder: 0,
    },
  ],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const baseReview: Review = {
  id: 'review-1',
  productId: 'product-1',
  userId: 'user-1',
  rating: 4,
  review: 'Beautiful fabric and fit.',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function createReviewRepositoryMock(): jest.Mocked<IReviewRepository> {
  return {
    findById: jest.fn(),
    findByProduct: jest.fn(),
    findByUserAndProduct: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getAggregateForProduct: jest.fn(),
  };
}

function createProductRepositoryMock(): jest.Mocked<IProductRepository> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    adjustSizeStock: jest.fn(),
    findByIds: jest.fn(),
    slugExists: jest.fn(),
    updateRatings: jest.fn(),
  };
}

describe('ReviewService', () => {
  let reviewRepository: jest.Mocked<IReviewRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let service: ReviewService;

  beforeEach(() => {
    reviewRepository = createReviewRepositoryMock();
    productRepository = createProductRepositoryMock();
    service = new ReviewService(reviewRepository, productRepository);
  });

  describe('createReview', () => {
    it('throws ConflictError when user already reviewed the product', async () => {
      productRepository.findById.mockResolvedValue(baseProduct);
      reviewRepository.findByUserAndProduct.mockResolvedValue(baseReview);

      await expect(
        service.createReview('user-1', 'product-1', { rating: 5, review: 'Great' }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(reviewRepository.create).not.toHaveBeenCalled();
      expect(productRepository.updateRatings).not.toHaveBeenCalled();
    });

    it('recomputes product ratings via aggregate after creating a review', async () => {
      productRepository.findById.mockResolvedValue(baseProduct);
      reviewRepository.findByUserAndProduct.mockResolvedValue(null);
      reviewRepository.create.mockResolvedValue(baseReview);
      reviewRepository.getAggregateForProduct.mockResolvedValue({ average: 4, count: 1 });

      await service.createReview('user-1', 'product-1', { rating: 4, review: 'Beautiful fabric and fit.' });

      expect(reviewRepository.getAggregateForProduct).toHaveBeenCalledWith('product-1');
      expect(productRepository.updateRatings).toHaveBeenCalledWith('product-1', {
        ratingsAverage: 4,
        ratingsCount: 1,
      });
    });

    it('throws NotFoundError when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        service.createReview('user-1', 'missing', { rating: 5, review: 'Great' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('updateReview', () => {
    it('throws ForbiddenError when non-author customer tries to update', async () => {
      reviewRepository.findById.mockResolvedValue(baseReview);

      await expect(
        service.updateReview('review-1', 'other-user', USER_ROLES.CUSTOMER, { rating: 5 }),
      ).rejects.toBeInstanceOf(ForbiddenError);

      expect(reviewRepository.update).not.toHaveBeenCalled();
    });

    it('allows admin to update any review and recomputes ratings', async () => {
      reviewRepository.findById.mockResolvedValue(baseReview);
      reviewRepository.update.mockResolvedValue({ ...baseReview, rating: 5 });
      reviewRepository.getAggregateForProduct.mockResolvedValue({ average: 5, count: 1 });

      await service.updateReview('review-1', 'admin-user', USER_ROLES.ADMIN, { rating: 5 });

      expect(reviewRepository.update).toHaveBeenCalledWith('review-1', { rating: 5 });
      expect(productRepository.updateRatings).toHaveBeenCalledWith('product-1', {
        ratingsAverage: 5,
        ratingsCount: 1,
      });
    });
  });

  describe('deleteReview', () => {
    it('throws ForbiddenError when non-author customer tries to delete', async () => {
      reviewRepository.findById.mockResolvedValue(baseReview);

      await expect(
        service.deleteReview('review-1', 'other-user', USER_ROLES.CUSTOMER),
      ).rejects.toBeInstanceOf(ForbiddenError);

      expect(reviewRepository.delete).not.toHaveBeenCalled();
    });

    it('recomputes product ratings to zero after deleting the only review', async () => {
      reviewRepository.findById.mockResolvedValue(baseReview);
      reviewRepository.getAggregateForProduct.mockResolvedValue({ average: 0, count: 0 });

      await service.deleteReview('review-1', 'user-1', USER_ROLES.CUSTOMER);

      expect(reviewRepository.delete).toHaveBeenCalledWith('review-1');
      expect(productRepository.updateRatings).toHaveBeenCalledWith('product-1', {
        ratingsAverage: 0,
        ratingsCount: 0,
      });
    });
  });
});
