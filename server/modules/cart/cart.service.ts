import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IProductRepository } from '../product/product.repository.interface';
import type { ProductService } from '../product/product.service';
import type { Product } from '../product/product.types';
import type { ICartRepository } from './cart.repository.interface';
import type {
  AddCartItemInput,
  Cart,
  CartItemWithLiveData,
  CartWithLiveData,
} from './cart.types';

export class CartService {
  constructor(
    private readonly cartRepository: ICartRepository,
    private readonly productRepository: IProductRepository,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    const existing = await this.cartRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }

    return this.cartRepository.createForUser(userId);
  }

  async getCartWithLiveData(userId: string): Promise<CartWithLiveData> {
    const cart = await this.getCart(userId);
    return this.enrichCart(cart);
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<CartWithLiveData> {
    await this.ensureCartExists(userId);
    const product = await this.getActiveProductWithSize(input.productId, input.sizeId);

    const existingCart = await this.cartRepository.findByUserId(userId);
    const existingItem = existingCart?.items.find(
      (item) => item.productId === input.productId && item.sizeId === input.sizeId,
    );
    const requestedTotal = (existingItem?.quantity ?? 0) + input.quantity;

    this.assertQuantityWithinStock(product, input.sizeId, requestedTotal);

    const cart = await this.cartRepository.addItem(userId, input);
    return this.enrichCart(cart);
  }

  async updateItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartWithLiveData> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const existingItem = cart.items.find((item) => item.cartItemId === cartItemId);
    if (!existingItem) {
      throw new NotFoundError('Cart item not found');
    }

    const product = await this.getActiveProductWithSize(existingItem.productId, existingItem.sizeId);
    this.assertQuantityWithinStock(product, existingItem.sizeId, quantity);

    const updatedCart = await this.cartRepository.updateItemQuantity(userId, cartItemId, quantity);
    return this.enrichCart(updatedCart);
  }

  async removeItem(userId: string, cartItemId: string): Promise<CartWithLiveData> {
    const updatedCart = await this.cartRepository.removeItem(userId, cartItemId);
    return this.enrichCart(updatedCart);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      return;
    }

    await this.cartRepository.clear(userId);
  }

  private async ensureCartExists(userId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      await this.cartRepository.createForUser(userId);
    }
  }

  private async getActiveProductWithSize(productId: string, sizeId: string): Promise<Product> {
    const product = await this.productRepository.findById(productId);

    if (!product || product.status !== 'active') {
      throw new NotFoundError('Product not found');
    }

    const size = product.sizes.find((entry) => entry.sizeId === sizeId);
    if (!size) {
      throw new NotFoundError('Size not found');
    }

    return product;
  }

  private assertQuantityWithinStock(product: Product, sizeId: string, quantity: number): void {
    const size = product.sizes.find((entry) => entry.sizeId === sizeId);
    if (!size) {
      throw new NotFoundError('Size not found');
    }

    if (quantity > size.quantity) {
      throw new InsufficientStockError(
        `Insufficient stock for size ${size.size}`,
        [{ field: 'quantity', message: `Only ${size.quantity} available` }],
      );
    }
  }

  private async enrichCart(cart: Cart): Promise<CartWithLiveData> {
    if (cart.items.length === 0) {
      return {
        id: cart.id,
        userId: cart.userId,
        items: [],
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
    }

    const productIds = [...new Set(cart.items.map((item) => item.productId))];
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((product) => [product.id, product]));

    const items: CartItemWithLiveData[] = [];

    for (const item of cart.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        continue;
      }

      const size = product.sizes.find((entry) => entry.sizeId === item.sizeId);
      if (!size) {
        continue;
      }

      const sortedImages = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
      const unitPrice = await this.productService.computeEffectivePrice(product);

      items.push({
        cartItemId: item.cartItemId,
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        productName: product.name,
        productImageUrl: sortedImages[0]?.imageUrl ?? null,
        unitPrice,
        sizeLabel: size.size,
        stock: size.quantity,
      });
    }

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
