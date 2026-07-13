import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { CategoryService } from './category.service';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  listCategories = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.listCategories();
    res.status(200).json(successResponse(categories));
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    const category = await this.categoryService.createCategory(req.body);
    res.status(201).json(successResponse(category));
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const category = await this.categoryService.updateCategory(id, req.body);
    res.status(200).json(successResponse(category));
  };
}
