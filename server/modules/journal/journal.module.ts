import { MongoJournalRepository } from '../../infrastructure/database/mongodb/repositories/journal.repository';
import { JournalController } from './journal.controller';
import { createJournalRoutes } from './journal.routes';
import { JournalService } from './journal.service';

const journalRepository = new MongoJournalRepository();
const journalService = new JournalService(journalRepository);
const journalController = new JournalController(journalService);
const routes = createJournalRoutes(journalController);

export const journalRoutes = routes.publicRoutes;
export const adminJournalRoutes = routes.adminRoutes;

export { journalService, journalRepository, journalController };
