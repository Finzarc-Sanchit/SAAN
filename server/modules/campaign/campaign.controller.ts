import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { CampaignService } from './campaign.service';

export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  listActiveCampaigns = async (_req: Request, res: Response): Promise<void> => {
    const campaigns = await this.campaignService.listActiveCampaigns();
    res.status(200).json(successResponse(campaigns));
  };

  listCampaigns = async (_req: Request, res: Response): Promise<void> => {
    const campaigns = await this.campaignService.listCampaigns();
    res.status(200).json(successResponse(campaigns));
  };

  getCampaign = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const campaign = await this.campaignService.getCampaignById(id);
    res.status(200).json(successResponse(campaign));
  };

  createCampaign = async (req: Request, res: Response): Promise<void> => {
    const campaign = await this.campaignService.createCampaign(req.body);
    res.status(201).json(successResponse(campaign));
  };

  updateCampaign = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const campaign = await this.campaignService.updateCampaign(id, req.body);
    res.status(200).json(successResponse(campaign));
  };

  deleteCampaign = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    await this.campaignService.deleteCampaign(id);
    res.status(200).json(successResponse({ message: 'Campaign deleted' }));
  };
}
