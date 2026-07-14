import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { CustomerAdminController } from './customer.admin.controller';
import { adminCustomerIdParamsDto, adminCustomerListQueryDto } from './customer.admin.dto';

export function createAdminCustomerRoutes(
  customerAdminController: CustomerAdminController,
): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.get('/', ...adminOnly, validate(adminCustomerListQueryDto, 'query'), customerAdminController.listCustomers);
  router.get(
    '/:id',
    ...adminOnly,
    validate(adminCustomerIdParamsDto, 'params'),
    customerAdminController.getCustomer,
  );

  return router;
}
