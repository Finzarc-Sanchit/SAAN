export const AUTH_COOKIE_PATH = '/api/v1/auth';
/** CSRF must be readable via document.cookie on any page — use site root, not auth path. */
export const CSRF_COOKIE_PATH = '/';
export const CSRF_HEADER = 'X-CSRF-Token';
