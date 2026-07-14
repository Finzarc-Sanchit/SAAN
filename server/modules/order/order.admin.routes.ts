import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { OrderController } from './order.controller';
import { adminOrderListQueryDto, orderIdParamsDto } from './order.dto';

export function createAdminOrderRoutes(orderController: OrderController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.get('/', ...adminOnly, validate(adminOrderListQueryDto, 'query'), orderController.listOrdersAdmin);
  router.get(
    '/:id',
    ...adminOnly,
    validate(orderIdParamsDto, 'params'),
    orderController.getOrderAdmin,
  );

  return router;
}
