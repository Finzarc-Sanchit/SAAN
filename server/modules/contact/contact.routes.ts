import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { publicFormRateLimiter } from '../../middlewares/rate-limit.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { ContactController } from './contact.controller';
import {
  contactIdParamsDto,
  contactListQueryDto,
  createContactDto,
  updateContactStatusDto,
} from './contact.dto';

export function createContactRoutes(controller: ContactController): {
  publicRoutes: Router;
  adminRoutes: Router;
} {
  const publicRoutes = Router();
  const adminRoutes = Router();

  publicRoutes.post('/', publicFormRateLimiter, validate(createContactDto), controller.create);

  adminRoutes.use(authMiddleware, requireRole(USER_ROLES.ADMIN));
  adminRoutes.get('/', validate(contactListQueryDto, 'query'), controller.list);
  adminRoutes.get('/:id', validate(contactIdParamsDto, 'params'), controller.get);
  adminRoutes.patch(
    '/:id/status',
    validate(contactIdParamsDto, 'params'),
    validate(updateContactStatusDto),
    controller.updateStatus,
  );
  adminRoutes.delete('/:id', validate(contactIdParamsDto, 'params'), controller.delete);

  return { publicRoutes, adminRoutes };
}
