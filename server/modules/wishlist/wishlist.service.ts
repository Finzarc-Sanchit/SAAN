import { NotFoundError } from '../../shared/errors/not-found-error';
import type { CartService } from '../cart/cart.service';
import type { IProductRepository } from '../product/product.repository.interface';
import type { ProductService } from '../product/product.service';
import type { IWishlistRepository } from './wishlist.repository.interface';
import type {
  Wishlist,
  WishlistItemWithLiveData,
  WishlistWithLiveData,
} from './wishlist.types';

export class WishlistService {
  constructor(
    private readonly wishlistRepository: IWishlistRepository,
    private readonly productRepository: IProductRepository,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
  ) {}

  async getWishlist(userId: string): Promise<Wishlist> {
    return this.getOrCreateWishlist(userId);
  }

  async getWishlistWithLiveData(userId: string): Promise<WishlistWithLiveData> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const productIds = wishlist.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productsById = new Map(products.map((product) => [product.id, product]));

    const items: WishlistItemWithLiveData[] = await Promise.all(
      wishlist.items.map(async (item) => {
        const product = productsById.get(item.productId) ?? null;
        const isUnavailable = !product || product.status === 'archived';

        if (!product) {
          return {
            ...item,
            product: null,
            isUnavailable: true,
          };
        }

        const effectivePrice = await this.productService.computeEffectivePrice(product);
        const primaryImage = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

        return {
          ...item,
          product: {
            name: product.name,
            imageUrl: primaryImage?.imageUrl ?? null,
            basePrice: product.basePrice,
            effectivePrice,
            status: product.status,
          },
          isUnavailable,
        };
      }),
    );

    return {
      ...wishlist,
      items,
    };
  }

  async addItem(userId: string, productId: string): Promise<Wishlist> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.status !== 'active') {
      throw new NotFoundError('Product not found');
    }

    await this.getOrCreateWishlist(userId);
    return this.wishlistRepository.addItem(userId, productId);
  }

  async removeItem(userId: string, wishlistItemId: string): Promise<Wishlist> {
    await this.getOrCreateWishlist(userId);
    return this.wishlistRepository.removeItem(userId, wishlistItemId);
  }

  async moveToCart(
    userId: string,
    wishlistItemId: string,
    sizeId: string,
    quantity: number,
  ): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const item = wishlist.items.find((entry) => entry.wishlistItemId === wishlistItemId);

    if (!item) {
      throw new NotFoundError('Wishlist item not found');
    }

    await this.cartService.addItem(userId, {
      productId: item.productId,
      sizeId,
      quantity,
    });
    return this.wishlistRepository.removeItem(userId, wishlistItemId);
  }

  private async getOrCreateWishlist(userId: string): Promise<Wishlist> {
    const existing = await this.wishlistRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }

    return this.wishlistRepository.createForUser(userId);
  }
}
