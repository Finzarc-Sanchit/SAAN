import { createStorageService } from '../../infrastructure/storage/create-storage.service';
import { UploadController } from './upload.controller';
import { createUploadRoutes } from './upload.routes';
import { UploadService } from './upload.service';

const storageService = createStorageService();
const uploadService = new UploadService(storageService);
const uploadController = new UploadController(uploadService);

export const uploadRoutes = createUploadRoutes(uploadController);

export { uploadService, uploadController, storageService };
