import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { UploadController } from './upload.controller';
import { uploadImagesMiddleware } from './upload.middleware';

export function createUploadRoutes(uploadController: UploadController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.post('/', ...adminOnly, uploadImagesMiddleware, uploadController.uploadImages);

  return router;
}
