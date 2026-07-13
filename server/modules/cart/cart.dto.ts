import { z } from 'zod';

export const addCartItemDto = z.object({
  productId: z.string().min(1, 'productId is required'),
  sizeId: z.string().min(1, 'sizeId is required'),
  quantity: z.number().int().positive('quantity must be at least 1'),
});

export const updateCartItemDto = z.object({
  quantity: z.number().int().positive('quantity must be at least 1'),
});

export const cartItemIdParamsDto = z.object({
  cartItemId: z.string().min(1, 'cartItemId is required'),
});

export type AddCartItemDto = z.infer<typeof addCartItemDto>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemDto>;
export type CartItemIdParamsDto = z.infer<typeof cartItemIdParamsDto>;
