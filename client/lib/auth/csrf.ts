import type { ApiResponse } from '@/lib/types/api';
import { CSRF_HEADER, CSRF_TOKEN_COOKIE_NAME } from '@/lib/api/config';

/** Cached CSRF token — kept in sync with the readable double-submit cookie. */
let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

/** Read the CSRF cookie — authoritative for the X-CSRF-Token header (double-submit). */
export function readCsrfFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${CSRF_TOKEN_COOKIE_NAME}=`;

  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length);
      return value ? decodeURIComponent(value) : null;
    }
  }

  return null;
}

function syncCsrfFromCookie(): string | null {
  const fromCookie = readCsrfFromCookie();
  if (fromCookie) {
    setCsrfToken(fromCookie);
  }
  return fromCookie;
}

export function getCsrfToken(): string | null {
  return syncCsrfFromCookie() ?? csrfToken;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function clearCsrfToken(): void {
  csrfToken = null;
  csrfFetchPromise = null;
}

export function csrfHeader(token: string): HeadersInit {
  return { [CSRF_HEADER]: token };
}

export function storeCsrfFromResponse(json: ApiResponse<{ csrfToken: string }>): string | null {
  if (json.success && json.data.csrfToken) {
    setCsrfToken(json.data.csrfToken);
    return json.data.csrfToken;
  }
  return null;
}

export function applyAuthSession(session: { csrfToken?: string }): void {
  if (syncCsrfFromCookie()) {
    return;
  }

  if (session.csrfToken) {
    setCsrfToken(session.csrfToken);
  }
}

async function fetchCsrfFromServer(): Promise<string> {
  const response = await fetch('/api/v1/auth/csrf', {
    method: 'GET',
    credentials: 'same-origin',
  });
  const json = (await response.json()) as ApiResponse<{ csrfToken: string }>;
  const token = storeCsrfFromResponse(json);

  if (!token) {
    throw new Error('Failed to obtain CSRF token');
  }

  // Prefer the cookie the server just set — header must match what the browser sends.
  return syncCsrfFromCookie() ?? token;
}

/**
 * Returns a CSRF token for the X-CSRF-Token header.
 * Uses the readable cookie when present; otherwise fetches from GET /auth/csrf.
 */
export async function ensureCsrfToken(): Promise<string> {
  const fromCookie = syncCsrfFromCookie();
  if (fromCookie) {
    return fromCookie;
  }

  if (csrfFetchPromise) {
    return csrfFetchPromise;
  }

  csrfFetchPromise = fetchCsrfFromServer().finally(() => {
    csrfFetchPromise = null;
  });

  return csrfFetchPromise;
}
