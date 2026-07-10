import type { ApiResponse } from '@/lib/types/api';
import type { AuthSession } from '@/lib/types/auth';
import { getApiBaseUrl } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/auth/token-store';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuthRefresh?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }

  return json.data;
}

async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const json = (await response.json()) as ApiResponse<AuthSession>;

    if (!json.success) {
      clearAccessToken();
      return false;
    }

    setAccessToken(json.data.accessToken);
    return true;
  } catch {
    clearAccessToken();
    return false;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuthRefresh, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...rest,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let response = await fetch(`${getApiBaseUrl()}${path}`, requestInit);

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
      response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...requestInit,
        headers: retryHeaders,
      });
    }
  }

  return parseResponse<T>(response);
}

export async function restoreSession(): Promise<AuthSession | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const json = (await response.json()) as ApiResponse<AuthSession>;

    if (!json.success) {
      clearAccessToken();
      return null;
    }

    setAccessToken(json.data.accessToken);
    return json.data;
  } catch {
    clearAccessToken();
    return null;
  }
}

export function clearSession(): void {
  clearAccessToken();
}
