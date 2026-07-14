import { AppError } from './app-error';

export class StorageError extends AppError {
  constructor(
    message = 'Image storage is unavailable',
    code: 'STORAGE_ERROR' | 'STORAGE_CONFIG_ERROR' = 'STORAGE_ERROR',
    details: unknown[] = [],
  ) {
    super(message, code === 'STORAGE_CONFIG_ERROR' ? 503 : 502, code, details);
  }
}
