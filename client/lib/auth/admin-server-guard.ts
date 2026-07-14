import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

/** Must match server `REFRESH_TOKEN_COOKIE_NAME` default. */
const REFRESH_TOKEN_COOKIE_NAME = 'saan_refresh_token';

/**
 * Auth access tokens live in client memory/sessionStorage — not cookies —
 * so a full SSR role check via refresh would rotate the refresh token without
 * being able to write Set-Cookie from an RSC layout (Next.js restriction).
 *
 * Server gate: require a refresh cookie (session present). Role enforcement
 * happens in AdminAccessGate after AuthProvider bootstraps (404 if not admin).
 */
export async function hasRefreshSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value);
}

export async function enforceAdminServerAccess(): Promise<void> {
  const hasCookie = await hasRefreshSessionCookie();
  if (!hasCookie) {
    notFound();
  }
}
