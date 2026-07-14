import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { UPLOAD } from '../../shared/constants';
import { ValidationError } from '../../shared/errors/validation-error';

type MulterLimitError = Error & {
  name: 'MulterError';
  code: string;
  field?: string;
};

function isMulterError(error: unknown): error is MulterLimitError {
  return (
    error instanceof Error &&
    error.name === 'MulterError' &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE_BYTES,
    files: UPLOAD.MAX_FILES,
  },
  fileFilter(_req, file, callback) {
    const allowed = UPLOAD.ALLOWED_MIME_TYPES as readonly string[];
    if (!allowed.includes(file.mimetype)) {
      callback(
        new ValidationError('Unsupported image type', [
          {
            field: 'files',
            message: `Unsupported type "${file.mimetype}". Allowed: ${UPLOAD.ALLOWED_MIME_TYPES.join(', ')}`,
          },
        ]),
      );
      return;
    }

    callback(null, true);
  },
});

function mapMulterError(error: MulterLimitError): ValidationError {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('File exceeds maximum size', [
      {
        field: 'files',
        message: `Each file must be at most ${UPLOAD.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
      },
    ]);
  }

  if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError(`A maximum of ${UPLOAD.MAX_FILES} images can be uploaded`, [
      {
        field: 'files',
        message: `Maximum ${UPLOAD.MAX_FILES} files allowed under field "${UPLOAD.FIELD_NAME}"`,
      },
    ]);
  }

  return new ValidationError('Invalid upload payload', [
    { field: 'files', message: error.message },
  ]);
}

/**
 * Parses multipart form field `files` (up to UPLOAD.MAX_FILES images) into memory buffers.
 */
export function uploadImagesMiddleware(req: Request, res: Response, next: NextFunction): void {
  memoryUpload.array(UPLOAD.FIELD_NAME, UPLOAD.MAX_FILES)(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (isMulterError(error)) {
      next(mapMulterError(error));
      return;
    }

    next(error);
  });
}
