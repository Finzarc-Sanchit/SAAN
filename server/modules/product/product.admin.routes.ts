import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { ProductController } from './product.controller';
import { productIdParamsDto } from './product.dto';

/**
 * Admin-only product reads that must return draft/archived products.
 * Public `GET /api/v1/products/:slug` only returns active products.
 */
export function createAdminProductRoutes(productController: ProductController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.get(
    '/:id',
    ...adminOnly,
    validate(productIdParamsDto, 'params'),
    productController.getProductById,
  );

  return router;
}
