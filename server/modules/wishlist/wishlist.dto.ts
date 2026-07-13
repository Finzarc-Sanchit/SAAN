import { z } from 'zod';

export const addWishlistItemBodyDto = z.object({
  productId: z.string().min(1, 'productId is required'),
});

export const wishlistItemIdParamsDto = z.object({
  wishlistItemId: z.string().min(1, 'wishlistItemId is required'),
});

export const moveToCartBodyDto = z.object({
  sizeId: z.string().min(1, 'sizeId is required'),
  quantity: z.coerce.number().int().min(1, 'quantity must be at least 1'),
});

export type AddWishlistItemBodyDto = z.infer<typeof addWishlistItemBodyDto>;
export type WishlistItemIdParamsDto = z.infer<typeof wishlistItemIdParamsDto>;
export type MoveToCartBodyDto = z.infer<typeof moveToCartBodyDto>;
