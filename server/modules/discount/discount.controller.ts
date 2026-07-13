import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { DiscountService } from './discount.service';

export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  listDiscounts = async (_req: Request, res: Response): Promise<void> => {
    const discounts = await this.discountService.listDiscounts();
    res.status(200).json(successResponse(discounts));
  };

  createDiscount = async (req: Request, res: Response): Promise<void> => {
    const discount = await this.discountService.createDiscount(req.body);
    res.status(201).json(successResponse(discount));
  };

  updateDiscount = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const discount = await this.discountService.updateDiscount(id, req.body);
    res.status(200).json(successResponse(discount));
  };

  deleteDiscount = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.discountService.deleteDiscount(id);
    res.status(200).json(successResponse({ message: 'Discount deleted' }));
  };
}
