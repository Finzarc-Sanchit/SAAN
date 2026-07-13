import { MongoSizeRepository } from '../../infrastructure/database/mongodb/repositories/size.repository';
import { SizeController } from './size.controller';
import { SizeService } from './size.service';

const sizeRepository = new MongoSizeRepository();
const sizeService = new SizeService(sizeRepository);
export const sizeController = new SizeController(sizeService);

export { sizeService, sizeRepository };
