import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { requireIdempotencyKey } from '../../middlewares/idempotency-key.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { OrderController } from './order.controller';
import {
  orderIdParamsDto,
  orderListQueryDto,
  placeOrderDto,
  updateOrderStatusDto,
} from './order.dto';

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.use(authMiddleware);

  router.get('/', validate(orderListQueryDto, 'query'), orderController.listOrders);
  router.get('/:id', validate(orderIdParamsDto, 'params'), orderController.getOrder);
  router.post(
    '/',
    requireIdempotencyKey,
    validate(placeOrderDto),
    orderController.placeOrder,
  );
  router.patch(
    '/:id/status',
    ...adminOnly,
    validate(orderIdParamsDto, 'params'),
    validate(updateOrderStatusDto),
    orderController.updateStatus,
  );
  router.post(
    '/:id/cancel',
    validate(orderIdParamsDto, 'params'),
    orderController.cancelPendingOrder,
  );

  return router;
}
