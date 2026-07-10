/** Relative API base — browser requests always go through the Next.js /api rewrite. */
export const API_BASE_PATH = '';

/**
 * Server-side only: direct origin of the Express backend.
 * Used by Next.js rewrites and SSR fetches — never exposed to the browser.
 */
export function getBackendOrigin(): string {
  const origin = process.env.BACKEND_ORIGIN;

  if (!origin) {
    throw new Error('BACKEND_ORIGIN is not configured');
  }

  return origin.replace(/\/$/, '');
}

export const AUTH_RETURN_KEY = 'saan-auth-return';
export const OTP_EXPIRY_SECONDS = 10 * 60;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

/** Cookie name for the double-submit CSRF token (must match server CSRF_TOKEN_COOKIE_NAME). */
export const CSRF_TOKEN_COOKIE_NAME = 'saan_csrf_token';
export const CSRF_HEADER = 'X-CSRF-Token';
