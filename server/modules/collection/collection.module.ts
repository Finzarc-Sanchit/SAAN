import { MongoCollectionRepository } from '../../infrastructure/database/mongodb/repositories/collection.repository';
import { CollectionController } from './collection.controller';
import { createCollectionRoutes } from './collection.routes';
import { CollectionService } from './collection.service';

const collectionRepository = new MongoCollectionRepository();
const collectionService = new CollectionService(collectionRepository);
const collectionController = new CollectionController(collectionService);
const routes = createCollectionRoutes(collectionController);

export const collectionRoutes = routes.publicRoutes;
export const adminCollectionRoutes = routes.adminRoutes;

export { collectionService, collectionRepository, collectionController };
