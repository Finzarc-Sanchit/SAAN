import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import {
  categoryIdParamsDto,
  createCategoryDto,
  updateCategoryDto,
} from './category.dto';
import { categoryController } from './category.module';

const router = Router();
const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

router.get('/', categoryController.listCategories);
router.post('/', ...adminOnly, validate(createCategoryDto), categoryController.createCategory);
router.patch(
  '/:id',
  ...adminOnly,
  validate(categoryIdParamsDto, 'params'),
  validate(updateCategoryDto),
  categoryController.updateCategory,
);

export const categoryRoutes = router;
