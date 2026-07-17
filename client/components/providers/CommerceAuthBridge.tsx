'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { syncGuestCommerceToServer } from '@/lib/commerce/guest-sync';

/**
 * When a session is restored (or login completes), merge any guest
 * cart/wishlist localStorage into the server account and hydrate UI.
 */
export function CommerceAuthBridge() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const syncedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      syncedForUserRef.current = null;
      return;
    }

    if (syncedForUserRef.current === user.id) return;
    syncedForUserRef.current = user.id;

    void syncGuestCommerceToServer().catch(() => {
      syncedForUserRef.current = null;
    });
  }, [isAuthenticated, isLoading, user]);

  return null;
}
