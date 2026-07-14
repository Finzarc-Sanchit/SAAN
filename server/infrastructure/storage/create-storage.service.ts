import { CloudinaryStorageService } from './cloudinary-storage.service';
import type { IStorageService } from './storage.interface';

/** Cloudinary is the only supported storage backend for product images. */
export function createStorageService(): IStorageService {
  return new CloudinaryStorageService();
}
