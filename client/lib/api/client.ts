import type { ApiResponse, PaginationMeta } from '@/lib/types/api';
import type { AuthSession } from '@/lib/types/auth';
import { API_BASE_PATH } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import {
  ensureCsrfToken,
  getCsrfToken,
  syncCsrfHeaderForRequest,
} from '@/lib/auth/csrf';
import {
  clearClientSession,
  ensureValidAccessToken,
  refreshSession,
  refreshSessionOnce,
} from '@/lib/auth/session-client';
import { getAccessToken } from '@/lib/auth/token-store';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuthRefresh?: boolean;
  /** Send double-submit CSRF header (auth mutation endpoints). */
  withCsrf?: boolean;
};

export type ApiResultWithMeta<T> = {
  data: T;
  meta?: PaginationMeta;
};

const AUTH_MUTATION_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/me',
  '/api/v1/auth/reset-password',
]);

function resolveUrl(path: string): string {
  return `${API_BASE_PATH}${path}`;
}

function needsCsrf(path: string, withCsrf?: boolean): boolean {
  return withCsrf ?? AUTH_MUTATION_PATHS.has(path);
}

async function parseResponse<T>(response: Response): Promise<{ data: T; meta?: PaginationMeta }> {
  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }

  return { data: json.data, meta: json.meta };
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const result = await apiRequestWithMeta<T>(path, options);
  return result.data;
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResultWithMeta<T>> {
  const { body, skipAuthRefresh, withCsrf, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const token = skipAuthRefresh ? null : await ensureValidAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (needsCsrf(path, withCsrf)) {
    const csrf = await ensureCsrfToken();
    syncCsrfHeaderForRequest(headers, csrf);
  }

  const requestInit: RequestInit = {
    ...rest,
    headers,
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let response = await fetch(resolveUrl(path), requestInit);

  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    !path.endsWith('/auth/refresh') &&
    !path.endsWith('/auth/login')
  ) {
    const refreshed = await refreshSession();

    if (refreshed) {
      const accessToken = getAccessToken();
      if (accessToken) {
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${accessToken}`);
        syncCsrfHeaderForRequest(retryHeaders, getCsrfToken());

        response = await fetch(resolveUrl(path), {
          ...requestInit,
          headers: retryHeaders,
        });
      }
    }
  }

  return parseResponse<T>(response);
}

export async function restoreSession(): Promise<AuthSession | null> {
  return refreshSessionOnce();
}

export function clearSession(): void {
  clearClientSession();
}

// Re-export for auth.ts consumers if needed
export { ensureCsrfToken } from '@/lib/auth/csrf';
