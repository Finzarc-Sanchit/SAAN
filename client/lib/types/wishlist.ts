export type WishlistProductSize = {
  sizeId: string;
  size: string;
  quantity: number;
};

export type WishlistProductSnapshot = {
  name: string;
  slug: string;
  imageUrl: string | null;
  basePrice: number;
  effectivePrice: number;
  status: string;
  sizes: WishlistProductSize[];
};

export type WishlistItem = {
  wishlistItemId: string;
  productId: string;
  addedAt: string;
  product?: WishlistProductSnapshot | null;
  isUnavailable?: boolean;
};

export type Wishlist = {
  id: string;
  userId: string;
  items: WishlistItem[];
};
