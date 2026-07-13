import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { ReviewListQueryDto } from './review.dto';
import type { ReviewService } from './review.service';

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  listByProduct = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params as { productId: string };
    const { page, limit, sort } = req.query as unknown as ReviewListQueryDto;

    const result = await this.reviewService.listReviewsByProduct(
      productId,
      { page, limit },
      { sort },
    );

    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params as { productId: string };
    const review = await this.reviewService.createReview(req.user!.id, productId, req.body);
    res.status(201).json(successResponse(review));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const review = await this.reviewService.updateReview(
      id,
      req.user!.id,
      req.user!.role,
      req.body,
    );
    res.status(200).json(successResponse(review));
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.reviewService.deleteReview(id, req.user!.id, req.user!.role);
    res.status(200).json(successResponse({ message: 'Review deleted' }));
  };
}
