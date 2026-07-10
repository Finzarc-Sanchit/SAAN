'use client';

import { useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export function useRequireAuth() {
  const { isAuthenticated, isLoading, openLoginDialog, queuePendingAction } = useAuth();

  const requireAuth = useCallback(
    (action: () => void) => {
      if (isLoading) return false;

      if (isAuthenticated) {
        action();
        return true;
      }

      queuePendingAction(action);
      openLoginDialog('login');
      return false;
    },
    [isAuthenticated, isLoading, openLoginDialog, queuePendingAction],
  );

  return { requireAuth, isAuthenticated, isLoading };
}
