import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { publicFormRateLimiter } from '../../middlewares/rate-limit.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { AppointmentController } from './appointment.controller';
import {
  appointmentIdParamsDto,
  appointmentListQueryDto,
  availabilityQueryDto,
  createAppointmentDto,
  rescheduleAppointmentDto,
  updateAppointmentDto,
  updateAppointmentSettingsDto,
  updateAppointmentStatusDto,
} from './appointment.dto';

export function createAppointmentRoutes(controller: AppointmentController): {
  publicRoutes: Router;
  adminRoutes: Router;
  adminSettingsRoutes: Router;
} {
  const publicRoutes = Router();
  const adminRoutes = Router();
  const adminSettingsRoutes = Router();

  publicRoutes.get('/context', controller.getPublicContext);
  publicRoutes.get(
    '/availability',
    validate(availabilityQueryDto, 'query'),
    controller.getAvailability,
  );
  publicRoutes.post('/', publicFormRateLimiter, validate(createAppointmentDto), controller.create);

  adminRoutes.use(authMiddleware, requireRole(USER_ROLES.ADMIN));
  adminRoutes.get('/', validate(appointmentListQueryDto, 'query'), controller.list);
  adminRoutes.get('/:id', validate(appointmentIdParamsDto, 'params'), controller.get);
  adminRoutes.patch(
    '/:id',
    validate(appointmentIdParamsDto, 'params'),
    validate(updateAppointmentDto),
    controller.update,
  );
  adminRoutes.patch(
    '/:id/status',
    validate(appointmentIdParamsDto, 'params'),
    validate(updateAppointmentStatusDto),
    controller.updateStatus,
  );
  adminRoutes.post(
    '/:id/reschedule',
    validate(appointmentIdParamsDto, 'params'),
    validate(rescheduleAppointmentDto),
    controller.reschedule,
  );
  adminRoutes.delete('/:id', validate(appointmentIdParamsDto, 'params'), controller.delete);

  adminSettingsRoutes.use(authMiddleware, requireRole(USER_ROLES.ADMIN));
  adminSettingsRoutes.get('/', controller.getSettings);
  adminSettingsRoutes.patch('/', validate(updateAppointmentSettingsDto), controller.updateSettings);

  return { publicRoutes, adminRoutes, adminSettingsRoutes };
}
