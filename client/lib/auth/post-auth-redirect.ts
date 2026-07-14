import type { User, UserRole } from '@/lib/types/auth';

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';

export function getPostAuthPath(
  role: UserRole,
  returnTo?: string | null,
): string {
  if (role === 'admin') {
    return ADMIN_DASHBOARD_PATH;
  }

  if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    return returnTo;
  }

  return '/';
}

export function getPostAuthPathForUser(
  user: Pick<User, 'role'> | null | undefined,
  returnTo?: string | null,
): string {
  if (!user) {
    return '/';
  }

  return getPostAuthPath(user.role, returnTo);
}
