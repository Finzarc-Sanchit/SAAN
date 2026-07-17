import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { publicFormRateLimiter } from '../../middlewares/rate-limit.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { NewsletterController } from './newsletter.controller';
import {
  newsletterIdParamsDto,
  newsletterListQueryDto,
  subscribeNewsletterDto,
  updateNewsletterStatusDto,
} from './newsletter.dto';

export function createNewsletterRoutes(controller: NewsletterController): {
  publicRoutes: Router;
  adminRoutes: Router;
} {
  const publicRoutes = Router();
  const adminRoutes = Router();

  publicRoutes.post('/', publicFormRateLimiter, validate(subscribeNewsletterDto), controller.subscribe);

  adminRoutes.use(authMiddleware, requireRole(USER_ROLES.ADMIN));
  adminRoutes.get('/', validate(newsletterListQueryDto, 'query'), controller.list);
  adminRoutes.patch(
    '/:id/status',
    validate(newsletterIdParamsDto, 'params'),
    validate(updateNewsletterStatusDto),
    controller.updateStatus,
  );
  adminRoutes.delete('/:id', validate(newsletterIdParamsDto, 'params'), controller.delete);

  return { publicRoutes, adminRoutes };
}
