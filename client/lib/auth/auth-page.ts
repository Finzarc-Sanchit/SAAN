export type AuthPageMode = 'register' | 'login' | 'forgot-password';

export const AUTH_PAGE_MODE_PARAM = 'mode';

export function parseAuthPageMode(value: string | null): AuthPageMode {
  if (value === 'login' || value === 'forgot-password') {
    return value;
  }

  return 'register';
}

export function buildAuthPageUrl(
  mode: AuthPageMode,
  params?: { returnTo?: string | null },
): string {
  const search = new URLSearchParams();

  if (mode !== 'register') {
    search.set(AUTH_PAGE_MODE_PARAM, mode);
  }

  if (params?.returnTo) {
    search.set('returnTo', params.returnTo);
  }

  const query = search.toString();
  return query ? `/register?${query}` : '/register';
}
