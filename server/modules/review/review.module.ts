import { MongoReviewRepository } from '../../infrastructure/database/mongodb/repositories/review.repository';
import { productRepository } from '../product/product.module';
import { ReviewController } from './review.controller';
import { createProductReviewRoutes, createReviewRoutes } from './review.routes';
import { ReviewService } from './review.service';

const reviewRepository = new MongoReviewRepository();
const reviewService = new ReviewService(reviewRepository, productRepository);
const reviewController = new ReviewController(reviewService);

export const productReviewRoutes = createProductReviewRoutes(reviewController);
export const reviewRoutes = createReviewRoutes(reviewController);

export { reviewService, reviewRepository, reviewController };
