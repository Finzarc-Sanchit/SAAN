import type { Request, Response } from 'express';
import { USER_ROLES } from '../../shared/constants';
import { successResponse } from '../../shared/utils/response';
import type { ProductFilterDto } from './product.dto';
import type { ProductService } from './product.service';

export class ProductController {
  constructor(private readonly productService: ProductService) { }

  listProducts = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ProductFilterDto;
    const { page, limit, sort, ...filter } = query;

    const isAdmin = req.user?.role === USER_ROLES.ADMIN;
    const result = await this.productService.listProducts(
      { ...filter, sort: sort as never },
      { page, limit },
      { includeAllStatuses: isAdmin },
    );

    res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      }),
    );
  };

  getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params as { slug: string; };
    const product = await this.productService.getProductBySlug(slug);
    res.status(200).json(successResponse(product));
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string; };
    const product = await this.productService.getProductById(id);
    res.status(200).json(successResponse(product));
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.createProduct(req.body);
    res.status(201).json(successResponse(product));
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string; };
    const product = await this.productService.updateProduct(id, req.body);
    res.status(200).json(successResponse(product));
  };

  archiveProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string; };
    await this.productService.archiveProduct(id);
    res.status(200).json(successResponse({ message: 'Product archived' }));
  };

  adjustSizeStock = async (req: Request, res: Response): Promise<void> => {
    const { id, sizeId } = req.params as { id: string; sizeId: string; };
    const product = await this.productService.adjustStock(id, sizeId, req.body.quantityDelta);
    res.status(200).json(successResponse(product));
  };
}
