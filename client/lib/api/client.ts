import type { ApiResponse } from '@/lib/types/api';
import type { AuthSession } from '@/lib/types/auth';
import { API_BASE_PATH } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import {
  applyAuthSession,
  clearCsrfToken,
  csrfHeader,
  ensureCsrfToken,
} from '@/lib/auth/csrf';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/token-store';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuthRefresh?: boolean;
  /** Send double-submit CSRF header (auth mutation endpoints). */
  withCsrf?: boolean;
};

const AUTH_MUTATION_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/reset-password',
]);

function resolveUrl(path: string): string {
  return `${API_BASE_PATH}${path}`;
}

function needsCsrf(path: string, withCsrf?: boolean): boolean {
  return withCsrf ?? AUTH_MUTATION_PATHS.has(path);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }

  return json.data;
}

async function refreshSession(): Promise<boolean> {
  try {
    const csrf = await ensureCsrfToken({ force: true });

    const response = await fetch(resolveUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: csrfHeader(csrf),
    });
    const json = (await response.json()) as ApiResponse<AuthSession>;

    if (!json.success) {
      clearAccessToken();
      return false;
    }

    setAccessToken(json.data.accessToken);
    applyAuthSession(json.data);
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuthRefresh, withCsrf, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let csrf: string | undefined;
  if (needsCsrf(path, withCsrf)) {
    csrf = await ensureCsrfToken({ force: true });
    for (const [key, value] of Object.entries(csrfHeader(csrf))) {
      headers.set(key, value as string);
    }
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
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${getAccessToken()}`);
      response = await fetch(resolveUrl(path), {
        ...requestInit,
        headers: retryHeaders,
      });
    }
  }

  return parseResponse<T>(response);
}

export async function restoreSession(): Promise<AuthSession | null> {
  try {
    const csrf = await ensureCsrfToken();

    const response = await fetch(resolveUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: csrfHeader(csrf),
    });
    const json = (await response.json()) as ApiResponse<AuthSession>;

    if (!json.success) {
      clearAccessToken();
      return null;
    }

    setAccessToken(json.data.accessToken);
    applyAuthSession(json.data);
    return json.data;
  } catch {
    clearAccessToken();
    return null;
  }
}

export function clearSession(): void {
  clearAccessToken();
  clearCsrfToken();
}

// Re-export for auth.ts consumers if needed
export { ensureCsrfToken } from '@/lib/auth/csrf';
