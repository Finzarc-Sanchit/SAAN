'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import type { User } from '@/lib/types/auth';

type CurrentUserResult = {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

/**
 * Convenience wrapper around AuthProvider for surfaces that only need
 * the current user session (e.g. admin topbar avatar).
 */
export function useCurrentUser(): CurrentUserResult {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();

  return {
    user,
    isAuthenticated,
    isBootstrapping: isLoading,
    isLoading,
    refreshUser,
  };
}
