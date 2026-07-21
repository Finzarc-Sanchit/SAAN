'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWishlist } from '@/hooks/useWishlist';
import {
  addWishlistItem,
  removeWishlistItemByProductId,
  wishlistQueryKeys,
} from '@/lib/api/wishlist';

const SYNC_DELAY_MS = 1_200;

type PendingSync = {
  timer: ReturnType<typeof setTimeout>;
  wishlisted: boolean;
};

/**
 * Debounced wishlist toggle — UI updates instantly, server sync waits
 * until the user stops clicking for 1.2 seconds (same pattern Amazon/
 * Flipkart use to avoid spamming the API on rapid toggles).
 */
export function useDebouncedWishlistSync(productId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(productId);
  const pendingRef = useRef<PendingSync | null>(null);
  const serverStateRef = useRef<boolean>(wishlisted);

  useEffect(() => {
    serverStateRef.current = wishlisted;
  }, [wishlisted]);

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timer);
        pendingRef.current = null;
      }
    };
  }, []);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.all });
  }, [queryClient]);

  const syncToServer = useCallback(
    (targetWishlisted: boolean) => {
      if (targetWishlisted === serverStateRef.current) {
        return;
      }

      const request = targetWishlisted
        ? addWishlistItem(productId)
        : removeWishlistItemByProductId(productId);

      void request
        .then(() => {
          serverStateRef.current = targetWishlisted;
          invalidate();
        })
        .catch(() => {
          toggleWishlist(productId);
          serverStateRef.current = !targetWishlisted;
        });
    },
    [productId, invalidate, toggleWishlist],
  );

  const toggle = useCallback(() => {
    const nextWishlisted = !wishlisted;
    toggleWishlist(productId);

    if (!isAuthenticated) {
      return;
    }

    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
    }

    pendingRef.current = {
      wishlisted: nextWishlisted,
      timer: setTimeout(() => {
        const final = pendingRef.current?.wishlisted;
        pendingRef.current = null;
        if (final !== undefined) {
          syncToServer(final);
        }
      }, SYNC_DELAY_MS),
    };
  }, [wishlisted, productId, isAuthenticated, toggleWishlist, syncToServer]);

  return { wishlisted, toggle };
}
