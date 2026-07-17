import { apiRequest } from '@/lib/api/client';
import type { Wishlist } from '@/lib/types/wishlist';

const WISHLIST_BASE = '/api/v1/wishlist';

export const wishlistQueryKeys = {
  all: ['wishlist'] as const,
  detail: () => [...wishlistQueryKeys.all, 'detail'] as const,
};

export type ServerWishlistItem = Wishlist['items'][number];
export type ServerWishlist = Wishlist;

export async function getWishlist(): Promise<Wishlist> {
  return apiRequest<Wishlist>(WISHLIST_BASE);
}

export async function addWishlistItem(productId: string): Promise<Wishlist> {
  return apiRequest<Wishlist>(`${WISHLIST_BASE}/items`, {
    method: 'POST',
    body: { productId },
  });
}

export async function removeWishlistItem(wishlistItemId: string): Promise<Wishlist> {
  return apiRequest<Wishlist>(`${WISHLIST_BASE}/items/${wishlistItemId}`, {
    method: 'DELETE',
  });
}

export async function removeWishlistItemByProductId(
  productId: string,
): Promise<Wishlist | null> {
  const wishlist = await getWishlist();
  const item = wishlist.items.find((entry) => entry.productId === productId);
  if (!item) {
    return wishlist;
  }

  return removeWishlistItem(item.wishlistItemId);
}

export async function moveWishlistItemToCart(
  wishlistItemId: string,
  input: { sizeId: string; quantity: number },
): Promise<Wishlist> {
  return apiRequest<Wishlist>(`${WISHLIST_BASE}/items/${wishlistItemId}/move-to-cart`, {
    method: 'POST',
    body: input,
  });
}
