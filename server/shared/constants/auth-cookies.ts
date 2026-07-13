/** Legacy path from before the Next.js /api proxy — cleared on every auth cookie write. */
export const LEGACY_AUTH_COOKIE_PATH = '/api/v1/auth';
/** Site-wide path so the refresh cookie is sent on all proxied /api/* requests. */
export const REFRESH_COOKIE_PATH = '/';
/** CSRF must be readable via document.cookie on any page. */
export const CSRF_COOKIE_PATH = '/';
export const CSRF_HEADER = 'X-CSRF-Token';
