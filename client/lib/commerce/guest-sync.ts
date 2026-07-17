import { addCartItem, getCart, mapServerCartToLocal } from '@/lib/api/cart';
import { addWishlistItem, getWishlist } from '@/lib/api/wishlist';
import type { CartItem } from '@/lib/types/cart';

export const CART_STORAGE_KEY = 'saan-cart';
export const WISHLIST_STORAGE_KEY = 'saan-wishlist';
export const COMMERCE_HYDRATED_EVENT = 'saan:commerce-hydrated';

export type CommerceHydratedDetail = {
  cart: CartItem[];
  wishlist: string[];
};

function readGuestCart(): CartItem[] {
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

function readGuestWishlist(): string[] {
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

function clearGuestCommerceStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(WISHLIST_STORAGE_KEY);
}

function dispatchHydrated(detail: CommerceHydratedDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CommerceHydratedDetail>(COMMERCE_HYDRATED_EVENT, { detail }));
}

let syncInFlight: Promise<CommerceHydratedDetail> | null = null;

/**
 * Push guest localStorage cart/wishlist to the authenticated server account,
 * clear guest storage, then hydrate UI from the server copy.
 */
export async function syncGuestCommerceToServer(): Promise<CommerceHydratedDetail> {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    const guestCart = readGuestCart();
    const guestWishlist = readGuestWishlist();

    for (const item of guestCart) {
      if (!item.sizeId || !item.productId || item.quantity < 1) continue;
      try {
        await addCartItem({
          productId: item.productId,
          sizeId: item.sizeId,
          quantity: item.quantity,
        });
      } catch {
        // Skip lines that fail stock/validation so the rest can still sync.
      }
    }

    for (const productId of guestWishlist) {
      try {
        await addWishlistItem(productId);
      } catch {
        // Skip unavailable products.
      }
    }

    clearGuestCommerceStorage();

    const [serverCart, serverWishlist] = await Promise.all([getCart(), getWishlist()]);
    const detail: CommerceHydratedDetail = {
      cart: mapServerCartToLocal(serverCart),
      wishlist: serverWishlist.items.map((entry) => entry.productId),
    };

    dispatchHydrated(detail);
    return detail;
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}
