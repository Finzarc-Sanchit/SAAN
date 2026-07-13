import type { AddCartItemInput, Cart } from './cart.types';

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  createForUser(userId: string): Promise<Cart>;
  addItem(userId: string, item: AddCartItemInput): Promise<Cart>;
  updateItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<Cart>;
  removeItem(userId: string, cartItemId: string): Promise<Cart>;
  clear(userId: string): Promise<void>;
}
