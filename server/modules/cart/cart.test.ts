import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { IProductRepository } from '../product/product.repository.interface';
import type { ProductService } from '../product/product.service';
import type { Product } from '../product/product.types';
import type { ICartRepository } from './cart.repository.interface';
import { CartService } from './cart.service';
import type { Cart } from './cart.types';

const baseProduct: Product = {
  id: 'product-1',
  categoryId: 'cat-1',
  discountId: null,
  name: 'Linen Shirt',
  slug: 'linen-shirt',
  description: 'A linen shirt',
  shortDescription: 'Linen shirt',
  fabric: 'Linen',
  basePrice: 5000,
  ratingsAverage: 0,
  ratingsCount: 0,
  stock: 15,
  status: 'active',
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  sizes: [
    {
      sizeId: 'size-1',
      size: 'S',
      quantity: 5,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      sizeId: 'size-2',
      size: 'M',
      quantity: 10,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
  ],
  images: [
    {
      imageId: 'image-1',
      imageUrl: 'https://example.com/shirt.jpg',
      sortOrder: 0,
    },
  ],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const emptyCart: Cart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function createCartRepositoryMock(): jest.Mocked<ICartRepository> {
  return {
    findByUserId: jest.fn(),
    createForUser: jest.fn(),
    addItem: jest.fn(),
    updateItemQuantity: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

function createProductRepositoryMock(): jest.Mocked<IProductRepository> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    adjustSizeStock: jest.fn(),
    findByIds: jest.fn(),
    slugExists: jest.fn(),
    updateRatings: jest.fn(),
  };
}

function createProductServiceMock(): jest.Mocked<Pick<ProductService, 'computeEffectivePrice'>> {
  return {
    computeEffectivePrice: jest.fn(),
  };
}

describe('CartService', () => {
  let cartRepository: jest.Mocked<ICartRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let productService: jest.Mocked<Pick<ProductService, 'computeEffectivePrice'>>;
  let cartService: CartService;

  beforeEach(() => {
    cartRepository = createCartRepositoryMock();
    productRepository = createProductRepositoryMock();
    productService = createProductServiceMock();
    cartService = new CartService(
      cartRepository,
      productRepository,
      productService as unknown as ProductService,
    );
  });

  it('getCart lazily creates a cart when none exists', async () => {
    cartRepository.findByUserId.mockResolvedValueOnce(null);
    cartRepository.createForUser.mockResolvedValueOnce(emptyCart);

    const cart = await cartService.getCart('user-1');

    expect(cart).toEqual(emptyCart);
    expect(cartRepository.createForUser).toHaveBeenCalledWith('user-1');
  });

  it('addItem delegates to repository after validating stock', async () => {
    const updatedCart: Cart = {
      ...emptyCart,
      items: [
        {
          cartItemId: 'line-1',
          productId: 'product-1',
          sizeId: 'size-1',
          quantity: 2,
          addedAt: new Date('2026-01-02'),
        },
      ],
    };

    cartRepository.findByUserId.mockResolvedValue(emptyCart);
    productRepository.findById.mockResolvedValue(baseProduct);
    cartRepository.addItem.mockResolvedValue(updatedCart);
    productRepository.findByIds.mockResolvedValue([baseProduct]);
    productService.computeEffectivePrice.mockResolvedValue(5000);

    const result = await cartService.addItem('user-1', {
      productId: 'product-1',
      sizeId: 'size-1',
      quantity: 2,
    });

    expect(cartRepository.addItem).toHaveBeenCalledWith('user-1', {
      productId: 'product-1',
      sizeId: 'size-1',
      quantity: 2,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.quantity).toBe(2);
  });

  it('addItem rejects when total quantity would exceed stock for an existing line', async () => {
    const cartWithItem: Cart = {
      ...emptyCart,
      items: [
        {
          cartItemId: 'line-1',
          productId: 'product-1',
          sizeId: 'size-1',
          quantity: 4,
          addedAt: new Date('2026-01-02'),
        },
      ],
    };

    cartRepository.findByUserId.mockResolvedValue(cartWithItem);
    productRepository.findById.mockResolvedValue(baseProduct);

    await expect(
      cartService.addItem('user-1', {
        productId: 'product-1',
        sizeId: 'size-1',
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(InsufficientStockError);

    expect(cartRepository.addItem).not.toHaveBeenCalled();
  });

  it('addItem rejects inactive products', async () => {
    cartRepository.findByUserId.mockResolvedValue(emptyCart);
    productRepository.findById.mockResolvedValue({ ...baseProduct, status: 'archived' });

    await expect(
      cartService.addItem('user-1', {
        productId: 'product-1',
        sizeId: 'size-1',
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(cartRepository.addItem).not.toHaveBeenCalled();
  });

  it('updateItemQuantity rejects when quantity exceeds stock', async () => {
    const cartWithItem: Cart = {
      ...emptyCart,
      items: [
        {
          cartItemId: 'line-1',
          productId: 'product-1',
          sizeId: 'size-1',
          quantity: 1,
          addedAt: new Date('2026-01-02'),
        },
      ],
    };

    cartRepository.findByUserId.mockResolvedValue(cartWithItem);
    productRepository.findById.mockResolvedValue(baseProduct);

    await expect(cartService.updateItemQuantity('user-1', 'line-1', 6)).rejects.toBeInstanceOf(
      InsufficientStockError,
    );

    expect(cartRepository.updateItemQuantity).not.toHaveBeenCalled();
  });
});

describe('MongoCartRepository.addItem', () => {
  it('increments quantity for an existing productId+sizeId instead of duplicating', async () => {
    const { MongoCartRepository } = await import(
      '../../infrastructure/database/mongodb/repositories/cart.repository'
    );
    const { CartModel } = await import('../../infrastructure/database/mongodb/models/cart.model');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const { connectMongo, disconnectMongo } = await import(
      '../../infrastructure/database/mongodb/connection'
    );
    const { Types } = await import('mongoose');

    const mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    await connectMongo();
    await CartModel.syncIndexes();

    const userId = new Types.ObjectId().toString();
    const productId = new Types.ObjectId().toString();
    const repository = new MongoCartRepository();

    await repository.createForUser(userId);
    await repository.addItem(userId, { productId, sizeId: 'size-1', quantity: 1 });
    const updated = await repository.addItem(userId, { productId, sizeId: 'size-1', quantity: 2 });

    expect(updated.items).toHaveLength(1);
    expect(updated.items[0]?.quantity).toBe(3);

    await CartModel.deleteMany({});
    await disconnectMongo();
    await mongod.stop();
  });
});
