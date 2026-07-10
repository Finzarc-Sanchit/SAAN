export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;

  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  return base.replace(/\/$/, '');
}

export const AUTH_RETURN_KEY = 'saan-auth-return';
export const OTP_EXPIRY_SECONDS = 10 * 60;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
