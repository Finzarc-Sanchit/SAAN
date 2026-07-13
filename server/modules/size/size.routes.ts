import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import { createSizeDto, sizeIdParamsDto, updateSizeDto } from './size.dto';
import { sizeController } from './size.module';

const router = Router();
const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

router.get('/', sizeController.listSizes);
router.post('/', ...adminOnly, validate(createSizeDto), sizeController.createSize);
router.patch(
  '/:id',
  ...adminOnly,
  validate(sizeIdParamsDto, 'params'),
  validate(updateSizeDto),
  sizeController.updateSize,
);
router.delete(
  '/:id',
  ...adminOnly,
  validate(sizeIdParamsDto, 'params'),
  sizeController.deleteSize,
);

export const sizeRoutes = router;
