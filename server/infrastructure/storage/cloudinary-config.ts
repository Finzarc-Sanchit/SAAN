import { env } from '../../config/env';

const PLACEHOLDER_CLOUDINARY = {
  cloudName: 'dev_cloudinary_cloud',
  apiKey: 'dev_cloudinary_key',
  apiSecret: 'dev_cloudinary_secret',
} as const;

/** True when real Cloudinary credentials are present (not env defaults / placeholders). */
export function isCloudinaryConfigured(): boolean {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;

  if (
    CLOUDINARY_CLOUD_NAME === PLACEHOLDER_CLOUDINARY.cloudName ||
    CLOUDINARY_API_KEY === PLACEHOLDER_CLOUDINARY.apiKey ||
    CLOUDINARY_API_SECRET === PLACEHOLDER_CLOUDINARY.apiSecret
  ) {
    return false;
  }

  if (
    CLOUDINARY_CLOUD_NAME.startsWith('your_') ||
    CLOUDINARY_API_KEY.startsWith('your_') ||
    CLOUDINARY_API_SECRET.startsWith('your_')
  ) {
    return false;
  }

  return true;
}

export const CLOUDINARY_SETUP_HINT =
  'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env (Cloudinary Dashboard → Settings → API Keys).';
