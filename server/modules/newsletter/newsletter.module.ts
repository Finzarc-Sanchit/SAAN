import { MongoNewsletterCampaignRepository } from '../../infrastructure/database/mongodb/repositories/newsletter-campaign.repository';
import { MongoNewsletterRepository } from '../../infrastructure/database/mongodb/repositories/newsletter.repository';
import { emailQueue } from '../../infrastructure/email/email.module';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import { NewsletterController } from './newsletter.controller';
import { createNewsletterRoutes } from './newsletter.routes';
import { NewsletterService } from './newsletter.service';

const newsletterRepository = new MongoNewsletterRepository();
const newsletterCampaignRepository = new MongoNewsletterCampaignRepository();
const newsletterService = new NewsletterService(newsletterRepository);
const newsletterCampaignService = new NewsletterCampaignService(
  newsletterRepository,
  newsletterCampaignRepository,
  emailQueue,
);
const newsletterController = new NewsletterController(
  newsletterService,
  newsletterCampaignService,
);
const routes = createNewsletterRoutes(newsletterController);

export const newsletterRoutes = routes.publicRoutes;
export const adminNewsletterRoutes = routes.adminRoutes;

export {
  newsletterRepository,
  newsletterCampaignRepository,
  newsletterService,
  newsletterCampaignService,
  newsletterController,
};
