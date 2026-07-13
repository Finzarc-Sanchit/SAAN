import { clearStoredSession, readStoredSession, writeStoredSession } from '@/lib/auth/session-storage';
import type { User } from '@/lib/types/auth';

let accessToken: string | null = null;

function hydrateFromStorage(): void {
  if (accessToken) {
    return;
  }

  const stored = readStoredSession();
  if (stored) {
    accessToken = stored.accessToken;
  }
}

export function getAccessToken(): string | null {
  hydrateFromStorage();
  return accessToken;
}

export function setAccessToken(token: string | null, user?: User): void {
  accessToken = token;

  if (!token) {
    return;
  }

  if (user) {
    writeStoredSession({ accessToken: token, user });
  }
}

export function clearAccessToken(): void {
  accessToken = null;
  clearStoredSession();
}
