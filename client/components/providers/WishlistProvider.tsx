'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  COMMERCE_HYDRATED_EVENT,
  WISHLIST_STORAGE_KEY,
  type CommerceHydratedDetail,
} from '@/lib/commerce/guest-sync';

type WishlistContextValue = {
  items: string[];
  count: number;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  replaceItems: (items: string[]) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStoredWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    function onCommerceHydrated(event: Event) {
      const detail = (event as CustomEvent<CommerceHydratedDetail>).detail;
      if (!detail) return;
      setItems(detail.wishlist);
      setHydrated(true);
    }

    window.addEventListener(COMMERCE_HYDRATED_EVENT, onCommerceHydrated);
    return () => window.removeEventListener(COMMERCE_HYDRATED_EVENT, onCommerceHydrated);
  }, []);

  const isWishlisted = useCallback((id: string) => items.includes(id), [items]);

  const replaceItems = useCallback((next: string[]) => {
    setItems(next);
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isWishlisted,
      toggleWishlist,
      replaceItems,
    }),
    [items, isWishlisted, toggleWishlist, replaceItems],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
