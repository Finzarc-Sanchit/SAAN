import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { PaymentController } from './payment.controller';
import { adminPaymentListQueryDto } from './payment.dto';

export function createAdminPaymentRoutes(paymentController: PaymentController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.get(
    '/',
    ...adminOnly,
    validate(adminPaymentListQueryDto, 'query'),
    paymentController.listPaymentsAdmin,
  );

  return router;
}
