import { cookies } from 'next/headers';
import type { ApiResponse } from '@/lib/types/api';
import {
  CSRF_HEADER,
  CSRF_TOKEN_COOKIE_NAME,
  getBackendOrigin,
} from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';

type ServerFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: HeadersInit;
  /** Attach the CSRF header from the incoming request cookies (auth mutations). */
  withCsrf?: boolean;
};

function buildCookieHeader(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): string {
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

/**
 * Server-to-server fetch to the Express backend.
 * Forwards the browser's cookies from the incoming Next.js request.
 */
export async function serverFetch(
  path: string,
  options: ServerFetchOptions = {},
): Promise<Response> {
  const { withCsrf = false, headers: initHeaders, ...rest } = options;
  const cookieStore = await cookies();
  const headers = new Headers(initHeaders);

  const cookieHeader = buildCookieHeader(cookieStore);
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader);
  }

  if (withCsrf) {
    const csrfToken = cookieStore.get(CSRF_TOKEN_COOKIE_NAME)?.value;
    if (csrfToken) {
      headers.set(CSRF_HEADER, csrfToken);
    }
  }

  return fetch(`${getBackendOrigin()}${path}`, {
    ...rest,
    headers,
    cache: 'no-store',
  });
}

export async function serverApiRequest<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const response = await serverFetch(path, options);
  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }

  return json.data;
}
