import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { SizeService } from './size.service';

export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  listSizes = async (_req: Request, res: Response): Promise<void> => {
    const sizes = await this.sizeService.listSizes();
    res.status(200).json(successResponse(sizes));
  };

  createSize = async (req: Request, res: Response): Promise<void> => {
    const size = await this.sizeService.createSize(req.body);
    res.status(201).json(successResponse(size));
  };

  updateSize = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const size = await this.sizeService.updateSize(id, req.body);
    res.status(200).json(successResponse(size));
  };

  deleteSize = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.sizeService.deleteSize(id);
    res.status(200).json(successResponse({ message: 'Size deleted' }));
  };
}
