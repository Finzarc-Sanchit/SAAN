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
  CART_STORAGE_KEY,
  COMMERCE_HYDRATED_EVENT,
  type CommerceHydratedDetail,
} from '@/lib/commerce/guest-sync';
import type { CartItem } from '@/lib/types/cart';

type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  lastAddedAt: number | null;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  replaceItems: (items: CartItem[]) => void;
  addItem: (
    item: Omit<CartItem, 'quantity'> & { quantity?: number },
    options?: { openDrawer?: boolean },
  ) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, delta: number, size?: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function sameLine(a: CartItem, b: Pick<CartItem, 'productId' | 'size' | 'sizeId'>): boolean {
  if (a.productId !== b.productId) return false;
  if (a.sizeId && b.sizeId) return a.sizeId === b.sizeId;
  return a.size === b.size;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    function onCommerceHydrated(event: Event) {
      const detail = (event as CustomEvent<CommerceHydratedDetail>).detail;
      if (!detail) return;
      setItems(detail.cart);
      setHydrated(true);
    }

    window.addEventListener(COMMERCE_HYDRATED_EVENT, onCommerceHydrated);
    return () => window.removeEventListener(COMMERCE_HYDRATED_EVENT, onCommerceHydrated);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const replaceItems = useCallback((next: CartItem[]) => {
    setItems(next);
  }, []);

  const addItem = useCallback(
    (
      item: Omit<CartItem, 'quantity'> & { quantity?: number },
      options?: { openDrawer?: boolean },
    ) => {
      const qty = item.quantity ?? 1;
      const openDrawer = options?.openDrawer ?? true;
      const { quantity: _q, ...cartFields } = item;
      setItems((prev) => {
        const existing = prev.find((entry) => sameLine(entry, cartFields));
        if (existing) {
          return prev.map((entry) =>
            sameLine(entry, cartFields)
              ? { ...entry, ...cartFields, quantity: entry.quantity + qty }
              : entry,
          );
        }
        return [...prev, { ...cartFields, quantity: qty }];
      });
      setLastAddedAt(Date.now());
      if (openDrawer) {
        setIsOpen(true);
      }
    },
    [],
  );

  const removeItem = useCallback((productId: string, size?: string) => {
    setItems((prev) =>
      prev.filter((entry) => entry.productId !== productId || entry.size !== size),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number, size?: string) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId || item.size !== size) return item;
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      isOpen,
      lastAddedAt,
      openCart,
      closeCart,
      clearCart,
      replaceItems,
      addItem,
      removeItem,
      updateQuantity,
    }),
    [
      items,
      count,
      isOpen,
      lastAddedAt,
      openCart,
      closeCart,
      clearCart,
      replaceItems,
      addItem,
      removeItem,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
