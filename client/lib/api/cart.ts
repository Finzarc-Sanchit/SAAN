import { apiRequest } from '@/lib/api/client';
import type { CartItem } from '@/lib/types/cart';

const CART_BASE = '/api/v1/cart';

export type ServerCartItem = {
  cartItemId: string;
  productId: string;
  sizeId: string;
  quantity: number;
  addedAt?: string;
  productName?: string;
  productImageUrl?: string | null;
  unitPrice?: number;
  sizeLabel?: string;
  stock?: number;
};

export type ServerCart = {
  id?: string;
  userId?: string;
  items: ServerCartItem[];
};

export async function getCart(): Promise<ServerCart> {
  return apiRequest<ServerCart>(CART_BASE);
}

export async function addCartItem(input: {
  productId: string;
  sizeId: string;
  quantity: number;
}): Promise<ServerCart> {
  return apiRequest<ServerCart>(`${CART_BASE}/items`, {
    method: 'POST',
    body: input,
  });
}

export async function clearCart(): Promise<void> {
  await apiRequest<{ message: string }>(CART_BASE, {
    method: 'DELETE',
  });
}

export function mapServerCartToLocal(cart: ServerCart, currency = 'INR'): CartItem[] {
  return cart.items.map((item) => ({
    productId: item.productId,
    sizeId: item.sizeId,
    name: item.productName ?? 'Product',
    price: item.unitPrice ?? 0,
    currency,
    image: item.productImageUrl ?? '/images/placeholder-product.jpg',
    quantity: item.quantity,
    size: item.sizeLabel,
  }));
}
