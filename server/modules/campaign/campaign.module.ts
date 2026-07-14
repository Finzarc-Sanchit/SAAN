import { MongoCampaignRepository } from '../../infrastructure/database/mongodb/repositories/campaign.repository';
import { productRepository } from '../product/product.module';
import { CampaignController } from './campaign.controller';
import { createCampaignRoutes } from './campaign.routes';
import { CampaignService } from './campaign.service';

const campaignRepository = new MongoCampaignRepository();
const campaignService = new CampaignService(campaignRepository, productRepository);
const campaignController = new CampaignController(campaignService);

export const campaignRoutes = createCampaignRoutes(campaignController);

export { campaignService, campaignRepository, campaignController };
