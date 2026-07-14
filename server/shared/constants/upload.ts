export const UPLOAD = {
  FIELD_NAME: 'files',
  MAX_FILES: 10,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  DEFAULT_FOLDER: 'saan/products',
} as const;

export type AllowedUploadMimeType = (typeof UPLOAD.ALLOWED_MIME_TYPES)[number];
