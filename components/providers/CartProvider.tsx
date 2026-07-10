'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartItem } from '@/lib/types/cart';

const STORAGE_KEY = 'saan-cart';

type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  lastAddedAt: number | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, delta: number, size?: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity ?? 1;
    const { quantity: _q, ...cartFields } = item;
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === cartFields.productId && i.size === cartFields.size
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === cartFields.productId && i.size === cartFields.size
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...cartFields, quantity: qty }];
    });
    setLastAddedAt(Date.now());
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size?: string) => {
    setItems((prev) =>
      prev.filter((i) => i.productId !== productId || i.size !== size)
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
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      isOpen,
      lastAddedAt,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
    }),
    [items, count, isOpen, lastAddedAt, openCart, closeCart, addItem, removeItem, updateQuantity]
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
