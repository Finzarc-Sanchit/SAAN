import { MongoNewsletterRepository } from '../../infrastructure/database/mongodb/repositories/newsletter.repository';
import { NewsletterController } from './newsletter.controller';
import { createNewsletterRoutes } from './newsletter.routes';
import { NewsletterService } from './newsletter.service';

const newsletterRepository = new MongoNewsletterRepository();
const newsletterService = new NewsletterService(newsletterRepository);
const newsletterController = new NewsletterController(newsletterService);
const routes = createNewsletterRoutes(newsletterController);

export const newsletterRoutes = routes.publicRoutes;
export const adminNewsletterRoutes = routes.adminRoutes;

export { newsletterRepository, newsletterService, newsletterController };
