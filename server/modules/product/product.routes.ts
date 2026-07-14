import { Router } from 'express';
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
} from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { ProductController } from './product.controller';
import {
  adjustStockBodyDto,
  adjustStockParamsDto,
  createProductDto,
  productFilterDto,
  productIdParamsDto,
  productSlugParamsDto,
  updateProductDto,
} from './product.dto';

export function createProductRoutes(productController: ProductController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.get(
    '/',
    optionalAuthMiddleware,
    validate(productFilterDto, 'query'),
    productController.listProducts,
  );
  router.post('/', ...adminOnly, validate(createProductDto), productController.createProduct);
  router.patch(
    '/:id/sizes/:sizeId/stock',
    ...adminOnly,
    validate(adjustStockParamsDto, 'params'),
    validate(adjustStockBodyDto),
    productController.adjustSizeStock,
  );
  router.patch(
    '/:id',
    ...adminOnly,
    validate(productIdParamsDto, 'params'),
    validate(updateProductDto),
    productController.updateProduct,
  );
  router.delete(
    '/:id',
    ...adminOnly,
    validate(productIdParamsDto, 'params'),
    productController.archiveProduct,
  );
  router.get('/:slug', validate(productSlugParamsDto, 'params'), productController.getProductBySlug);

  return router;
}
