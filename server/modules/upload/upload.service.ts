import type { UploadFileInput } from '../../infrastructure/storage/storage.interface';
import type { IStorageService } from '../../infrastructure/storage/storage.interface';
import {
  isCloudinaryConfigured,
} from '../../infrastructure/storage/cloudinary-config';
import { UPLOAD } from '../../shared/constants';
import { StorageError } from '../../shared/errors/storage-error';
import { ValidationError } from '../../shared/errors/validation-error';
import { toUploadedImage, type UploadImagesResult } from './upload.types';

export class UploadService {
  constructor(private readonly storageService: IStorageService) {}

  async uploadImages(files: UploadFileInput[]): Promise<UploadImagesResult> {
    if (!isCloudinaryConfigured()) {
      throw new StorageError('Image upload service is unavailable', 'STORAGE_CONFIG_ERROR');
    }
    if (files.length === 0) {
      throw new ValidationError('At least one image file is required', [
        { field: 'files', message: 'At least one image file is required' },
      ]);
    }

    if (files.length > UPLOAD.MAX_FILES) {
      throw new ValidationError(`A maximum of ${UPLOAD.MAX_FILES} images can be uploaded`, [
        { field: 'files', message: `Maximum ${UPLOAD.MAX_FILES} files allowed` },
      ]);
    }

    for (const file of files) {
      this.assertAllowedFile(file);
    }

    const stored = await this.storageService.uploadMany(files, {
      folder: UPLOAD.DEFAULT_FOLDER,
    });

    return { images: stored.map(toUploadedImage) };
  }

  private assertAllowedFile(file: UploadFileInput): void {
    const allowed = UPLOAD.ALLOWED_MIME_TYPES as readonly string[];

    if (!allowed.includes(file.mimeType)) {
      throw new ValidationError('Unsupported image type', [
        {
          field: 'files',
          message: `Unsupported type "${file.mimeType}". Allowed: ${UPLOAD.ALLOWED_MIME_TYPES.join(', ')}`,
        },
      ]);
    }

    if (file.buffer.length === 0) {
      throw new ValidationError('Empty file is not allowed', [
        { field: 'files', message: `File "${file.originalName}" is empty` },
      ]);
    }

    if (file.buffer.length > UPLOAD.MAX_FILE_SIZE_BYTES) {
      throw new ValidationError('File exceeds maximum size', [
        {
          field: 'files',
          message: `File "${file.originalName}" exceeds ${UPLOAD.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
        },
      ]);
    }
  }
}
