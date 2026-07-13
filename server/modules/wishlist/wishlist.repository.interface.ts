import type { Wishlist } from './wishlist.types';

export interface IWishlistRepository {
  findByUserId(userId: string): Promise<Wishlist | null>;
  createForUser(userId: string): Promise<Wishlist>;
  addItem(userId: string, productId: string): Promise<Wishlist>;
  removeItem(userId: string, wishlistItemId: string): Promise<Wishlist>;
}
