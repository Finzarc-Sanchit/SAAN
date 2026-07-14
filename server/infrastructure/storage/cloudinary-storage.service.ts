import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../../config/env';
import { StorageError } from '../../shared/errors/storage-error';
import type {
  IStorageService,
  StoredObject,
  StorageUploadOptions,
  UploadFileInput,
} from './storage.interface';

function toStoredObject(result: UploadApiResponse, mimeType: string): StoredObject {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    mimeType,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
  };
}

function mapCloudinaryError(error: unknown): StorageError {
  if (error && typeof error === 'object') {
    const cloudinaryError = error as { message?: string; http_code?: number };

    if (cloudinaryError.http_code === 401) {
      return new StorageError('Image upload service is unavailable', 'STORAGE_CONFIG_ERROR');
    }

    if (typeof cloudinaryError.message === 'string' && cloudinaryError.message.length > 0) {
      return new StorageError('Could not upload image to storage', 'STORAGE_ERROR');
    }
  }

  if (error instanceof Error && error.message) {
    return new StorageError('Could not upload image to storage', 'STORAGE_ERROR');
  }

  return new StorageError('Could not upload image to storage', 'STORAGE_ERROR');
}

export class CloudinaryStorageService implements IStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async upload(file: UploadFileInput, options?: StorageUploadOptions): Promise<StoredObject> {
    const folder = options?.folder ?? env.CLOUDINARY_FOLDER;

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            unique_filename: true,
            overwrite: false,
          },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error('Cloudinary upload returned no result'));
              return;
            }
            resolve(uploaded);
          },
        );

        stream.end(file.buffer);
      });

      return toStoredObject(result, file.mimeType);
    } catch (error) {
      throw mapCloudinaryError(error);
    }
  }

  async uploadMany(
    files: UploadFileInput[],
    options?: StorageUploadOptions,
  ): Promise<StoredObject[]> {
    return Promise.all(files.map((file) => this.upload(file, options)));
  }

  async delete(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      throw mapCloudinaryError(error);
    }
  }
}
