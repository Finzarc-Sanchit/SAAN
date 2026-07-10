import type { ApiResponse } from '@/lib/types/api';
import { CSRF_HEADER } from '@/lib/api/config';

/** In-memory CSRF token — sole source of truth for the X-CSRF-Token header. */
let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

export function getCsrfToken(): string | null {
  return csrfToken;
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

  return token;
}

/**
 * Returns a CSRF token, fetching from the server when needed.
 * Concurrent callers share one in-flight fetch unless `force` is set.
 */
export async function ensureCsrfToken(options?: { force?: boolean }): Promise<string> {
  if (!options?.force && csrfToken) {
    return csrfToken;
  }

  if (!options?.force && csrfFetchPromise) {
    return csrfFetchPromise;
  }

  const promise = fetchCsrfFromServer().finally(() => {
    if (csrfFetchPromise === promise) {
      csrfFetchPromise = null;
    }
  });

  if (!options?.force) {
    csrfFetchPromise = promise;
  }

  return promise;
}
