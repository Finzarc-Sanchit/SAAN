import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';

export const createReviewBodyDto = z.object({
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  review: z.string().min(1, 'Review text is required').max(2000, 'Review cannot exceed 2000 characters'),
});

export const updateReviewBodyDto = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    review: z.string().min(1).max(2000).optional(),
  })
  .refine((data) => data.rating !== undefined || data.review !== undefined, {
    message: 'At least one field (rating or review) is required',
  });

export const productIdParamsDto = z.object({
  productId: z.string().min(1, 'productId is required'),
});

export const reviewIdParamsDto = z.object({
  id: z.string().min(1, 'Review id is required'),
});

export const reviewListQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  sort: z.enum(['newest', 'oldest', 'rating_high', 'rating_low']).optional(),
});

export type CreateReviewBodyDto = z.infer<typeof createReviewBodyDto>;
export type UpdateReviewBodyDto = z.infer<typeof updateReviewBodyDto>;
export type ReviewListQueryDto = z.infer<typeof reviewListQueryDto>;
