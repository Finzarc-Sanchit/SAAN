import type { User } from '@/lib/types/auth';

const ACCESS_TOKEN_KEY = 'saan_access_token';
const USER_KEY = 'saan_user';

type StoredSession = {
  accessToken: string;
  user: User;
};

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }

    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='));
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  // Refresh one minute before expiry to avoid race with in-flight API calls.
  return payload.exp * 1000 <= Date.now() + 60_000;
}

export function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const userRaw = sessionStorage.getItem(USER_KEY);

    if (!accessToken || !userRaw) {
      return null;
    }

    if (isAccessTokenExpired(accessToken)) {
      return null;
    }

    const user = JSON.parse(userRaw) as User;
    if (!user?.id) {
      return null;
    }

    return { accessToken, user };
  } catch {
    return null;
  }
}

export function writeStoredSession(session: StoredSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
