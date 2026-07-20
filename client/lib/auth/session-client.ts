import type { ApiResponse } from '@/lib/types/api';
import type { AuthSession } from '@/lib/types/auth';
import { API_BASE_PATH } from '@/lib/api/config';
import {
  applyAuthSession,
  clearCsrfToken,
  csrfHeader,
  ensureCsrfToken,
} from '@/lib/auth/csrf';
import {
  isAccessTokenExpired,
  writeStoredSession,
} from '@/lib/auth/session-storage';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/token-store';

const REFRESH_PATH = '/api/v1/auth/refresh';

/** Deduplicates concurrent refresh calls so only one request rotates the refresh token. */
let refreshPromise: Promise<AuthSession | null> | null = null;

function resolveUrl(path: string): string {
  return `${API_BASE_PATH}${path}`;
}

function persistSession(session: AuthSession): void {
  setAccessToken(session.accessToken, session.user);
  writeStoredSession({ accessToken: session.accessToken, user: session.user });
  applyAuthSession(session);
}

async function performRefresh(): Promise<AuthSession | null> {
  try {
    const csrfToken = await ensureCsrfToken();
    const response = await fetch(resolveUrl(REFRESH_PATH), {
      method: 'POST',
      credentials: 'same-origin',
      headers: csrfHeader(csrfToken),
    });
    const json = (await response.json()) as ApiResponse<AuthSession>;

    if (!response.ok || !json.success) {
      return null;
    }

    persistSession(json.data);
    return json.data;
  } catch {
    return null;
  }
}

export function refreshSessionOnce(): Promise<AuthSession | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function refreshSession(): Promise<boolean> {
  const session = await refreshSessionOnce();
  return session !== null;
}

/**
 * Returns a non-expired access token when possible.
 * Silently refreshes first when the current token is missing or near expiry.
 */
export async function ensureValidAccessToken(): Promise<string | null> {
  const accessToken = getAccessToken();

  if (accessToken && !isAccessTokenExpired(accessToken)) {
    return accessToken;
  }

  const session = await refreshSessionOnce();
  return session?.accessToken ?? null;
}

export function clearClientSession(): void {
  refreshPromise = null;
  clearAccessToken();
  clearCsrfToken();
}
