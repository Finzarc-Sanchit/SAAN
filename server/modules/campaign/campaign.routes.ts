import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { CampaignController } from './campaign.controller';
import {
  campaignIdParamsDto,
  createCampaignDto,
  updateCampaignDto,
} from './campaign.dto';

export function createCampaignRoutes(campaignController: CampaignController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.get('/active', campaignController.listActiveCampaigns);
  router.get('/', ...adminOnly, campaignController.listCampaigns);
  router.get(
    '/:id',
    ...adminOnly,
    validate(campaignIdParamsDto, 'params'),
    campaignController.getCampaign,
  );
  router.post('/', ...adminOnly, validate(createCampaignDto), campaignController.createCampaign);
  router.patch(
    '/:id',
    ...adminOnly,
    validate(campaignIdParamsDto, 'params'),
    validate(updateCampaignDto),
    campaignController.updateCampaign,
  );
  router.delete(
    '/:id',
    ...adminOnly,
    validate(campaignIdParamsDto, 'params'),
    campaignController.deleteCampaign,
  );

  return router;
}
