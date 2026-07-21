import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { JournalController } from './journal.controller';
import {
  adminJournalListQueryDto,
  createJournalDto,
  journalIdParamsDto,
  journalSlugParamsDto,
  publicJournalListQueryDto,
  updateJournalDto,
} from './journal.dto';

export function createJournalRoutes(journalController: JournalController): {
  publicRoutes: Router;
  adminRoutes: Router;
} {
  const publicRoutes = Router();
  const adminRoutes = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  publicRoutes.get(
    '/',
    validate(publicJournalListQueryDto, 'query'),
    journalController.listPublished,
  );
  publicRoutes.get(
    '/:slug',
    validate(journalSlugParamsDto, 'params'),
    journalController.getPublishedBySlug,
  );

  adminRoutes.use(...adminOnly);
  adminRoutes.get(
    '/',
    validate(adminJournalListQueryDto, 'query'),
    journalController.listJournals,
  );
  adminRoutes.get(
    '/:id',
    validate(journalIdParamsDto, 'params'),
    journalController.getJournal,
  );
  adminRoutes.post('/', validate(createJournalDto), journalController.createJournal);
  adminRoutes.patch(
    '/:id',
    validate(journalIdParamsDto, 'params'),
    validate(updateJournalDto),
    journalController.updateJournal,
  );
  adminRoutes.delete(
    '/:id',
    validate(journalIdParamsDto, 'params'),
    journalController.deleteJournal,
  );

  return { publicRoutes, adminRoutes };
}
