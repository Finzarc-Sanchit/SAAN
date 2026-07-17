import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { CollectionController } from './collection.controller';
import {
  collectionIdParamsDto,
  collectionSlugParamsDto,
  createCollectionDto,
  updateCollectionDto,
} from './collection.dto';

export function createCollectionRoutes(collectionController: CollectionController): {
  publicRoutes: Router;
  adminRoutes: Router;
} {
  const publicRoutes = Router();
  const adminRoutes = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  publicRoutes.get('/', collectionController.listPublishedCollections);
  publicRoutes.get(
    '/:slug',
    validate(collectionSlugParamsDto, 'params'),
    collectionController.getPublishedCollection,
  );

  adminRoutes.use(...adminOnly);
  adminRoutes.get('/', collectionController.listCollections);
  adminRoutes.get(
    '/:id',
    validate(collectionIdParamsDto, 'params'),
    collectionController.getCollection,
  );
  adminRoutes.post('/', validate(createCollectionDto), collectionController.createCollection);
  adminRoutes.patch(
    '/:id',
    validate(collectionIdParamsDto, 'params'),
    validate(updateCollectionDto),
    collectionController.updateCollection,
  );
  adminRoutes.delete(
    '/:id',
    validate(collectionIdParamsDto, 'params'),
    collectionController.deleteCollection,
  );

  return { publicRoutes, adminRoutes };
}
