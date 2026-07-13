import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import {
  createDiscountDto,
  discountIdParamsDto,
  updateDiscountDto,
} from './discount.dto';
import { discountController } from './discount.module';

const router = Router();
const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

router.get('/', ...adminOnly, discountController.listDiscounts);
router.post('/', ...adminOnly, validate(createDiscountDto), discountController.createDiscount);
router.patch(
  '/:id',
  ...adminOnly,
  validate(discountIdParamsDto, 'params'),
  validate(updateDiscountDto),
  discountController.updateDiscount,
);
router.delete(
  '/:id',
  ...adminOnly,
  validate(discountIdParamsDto, 'params'),
  discountController.deleteDiscount,
);

export const discountRoutes = router;
