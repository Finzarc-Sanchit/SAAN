import type { IEmailQueue } from '../../infrastructure/email/email-queue.interface';
import { MongoContactRepository } from '../../infrastructure/database/mongodb/repositories/contact.repository';
import { ContactController } from './contact.controller';
import { createContactRoutes } from './contact.routes';
import { ContactService } from './contact.service';

/** Composes the contact module while keeping its email queue dependency injectable. */
export function createContactModule(emailQueue: IEmailQueue) {
  const contactRepository = new MongoContactRepository();
  const contactService = new ContactService(contactRepository, emailQueue);
  const contactController = new ContactController(contactService);
  const routes = createContactRoutes(contactController);

  return {
    contactRoutes: routes.publicRoutes,
    adminContactRoutes: routes.adminRoutes,
    contactRepository,
    contactService,
    contactController,
  };
}

export type ContactModule = ReturnType<typeof createContactModule>;
