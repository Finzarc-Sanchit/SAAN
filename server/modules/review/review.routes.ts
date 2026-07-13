import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import type { ReviewController } from './review.controller';
import {
  createReviewBodyDto,
  productIdParamsDto,
  reviewIdParamsDto,
  reviewListQueryDto,
  updateReviewBodyDto,
} from './review.dto';

export function createProductReviewRoutes(reviewController: ReviewController): Router {
  const router = Router();

  router.get(
    '/:productId/reviews',
    validate(productIdParamsDto, 'params'),
    validate(reviewListQueryDto, 'query'),
    reviewController.listByProduct,
  );

  router.post(
    '/:productId/reviews',
    authMiddleware,
    validate(productIdParamsDto, 'params'),
    validate(createReviewBodyDto),
    reviewController.create,
  );

  return router;
}

export function createReviewRoutes(reviewController: ReviewController): Router {
  const router = Router();

  router.patch(
    '/:id',
    authMiddleware,
    validate(reviewIdParamsDto, 'params'),
    validate(updateReviewBodyDto),
    reviewController.update,
  );

  router.delete(
    '/:id',
    authMiddleware,
    validate(reviewIdParamsDto, 'params'),
    reviewController.delete,
  );

  return router;
}
