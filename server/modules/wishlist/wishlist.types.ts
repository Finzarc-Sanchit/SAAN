import type { ProductStatus } from '../product/product.types';

export interface WishlistItem {
  wishlistItemId: string;
  productId: string;
  addedAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItemProductSnapshot {
  name: string;
  imageUrl: string | null;
  basePrice: number;
  effectivePrice: number;
  status: ProductStatus;
}

export interface WishlistItemWithLiveData extends WishlistItem {
  product: WishlistItemProductSnapshot | null;
  isUnavailable: boolean;
}

export interface WishlistWithLiveData extends Omit<Wishlist, 'items'> {
  items: WishlistItemWithLiveData[];
}
