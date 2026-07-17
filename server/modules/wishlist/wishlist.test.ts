import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { CartService } from '../cart/cart.service';
import type { IProductRepository } from '../product/product.repository.interface';
import type { ProductService } from '../product/product.service';
import type { Product } from '../product/product.types';
import type { IWishlistRepository } from './wishlist.repository.interface';
import { WishlistService } from './wishlist.service';
import type { Wishlist } from './wishlist.types';

const baseProduct: Product = {
  id: 'product-1',
  categoryId: 'cat-1',
  collectionId: 'collection-1',
  salePrice: null,
  discountPercent: null,
  discountEnabled: false,
  discountStartDate: null,
  discountEndDate: null,
  name: 'Linen Shirt',
  slug: 'linen-shirt',
  description: 'A linen shirt',
  shortDescription: 'Linen shirt',
  fabric: 'Linen',
  color: 'Ivory',
  occasion: ['Daily'],
  fitNotes: "Model is 5'6\" wearing S. Fit relaxed.",
  care: [
    'Dry Clean Only',
    'Do not Wash',
    'Do not Wring',
    'Iron at low temperature',
    'Tumble dry on Low Heat',
  ],
  basePrice: 5000,
  ratingsAverage: 0,
  ratingsCount: 0,
  stock: 10,
  status: 'active',
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  sizes: [
    {
      sizeId: 'size-1',
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

const baseWishlist: Wishlist = {
  id: 'wishlist-1',
  userId: 'user-1',
  items: [
    {
      wishlistItemId: 'wishlist-item-1',
      productId: 'product-1',
      addedAt: new Date('2026-01-01'),
    },
  ],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

function createWishlistRepositoryMock(): jest.Mocked<IWishlistRepository> {
  return {
    findByUserId: jest.fn(),
    createForUser: jest.fn(),
    addItem: jest.fn(),
    removeItem: jest.fn(),
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

function createCartServiceMock(): jest.Mocked<Pick<CartService, 'addItem'>> {
  return {
    addItem: jest.fn(),
  };
}

describe('WishlistService', () => {
  let wishlistRepository: jest.Mocked<IWishlistRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let productService: jest.Mocked<Pick<ProductService, 'computeEffectivePrice'>>;
  let cartService: jest.Mocked<Pick<CartService, 'addItem'>>;
  let service: WishlistService;

  beforeEach(() => {
    wishlistRepository = createWishlistRepositoryMock();
    productRepository = createProductRepositoryMock();
    productService = createProductServiceMock();
    cartService = createCartServiceMock();
    service = new WishlistService(
      wishlistRepository,
      productRepository,
      productService as unknown as ProductService,
      cartService as unknown as CartService,
    );
  });

  describe('addItem', () => {
    it('returns existing wishlist without error when product is already wishlisted', async () => {
      const duplicateWishlist: Wishlist = {
        ...baseWishlist,
        items: [
          {
            wishlistItemId: 'wishlist-item-1',
            productId: 'product-1',
            addedAt: new Date('2026-01-01'),
          },
        ],
      };

      productRepository.findById.mockResolvedValue(baseProduct);
      wishlistRepository.findByUserId.mockResolvedValue(duplicateWishlist);
      wishlistRepository.addItem.mockResolvedValue(duplicateWishlist);

      const result = await service.addItem('user-1', 'product-1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.productId).toBe('product-1');
      expect(wishlistRepository.addItem).toHaveBeenCalledWith('user-1', 'product-1');
    });

    it('throws NotFoundError when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(service.addItem('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundError);
      expect(wishlistRepository.addItem).not.toHaveBeenCalled();
    });
  });

  describe('moveToCart', () => {
    it('adds to cart and removes from wishlist', async () => {
      const updatedWishlist: Wishlist = {
        ...baseWishlist,
        items: [],
      };

      wishlistRepository.findByUserId.mockResolvedValue(baseWishlist);
      cartService.addItem.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [
          {
            cartItemId: 'cart-item-1',
            productId: 'product-1',
            sizeId: 'size-1',
            quantity: 1,
            addedAt: new Date('2026-01-01'),
            productName: 'Linen Shirt',
            productImageUrl: 'https://example.com/shirt.jpg',
            unitPrice: 5000,
            sizeLabel: 'M',
            stock: 10,
          },
        ],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });
      wishlistRepository.removeItem.mockResolvedValue(updatedWishlist);

      const result = await service.moveToCart('user-1', 'wishlist-item-1', 'size-1', 1);

      expect(cartService.addItem).toHaveBeenCalledWith('user-1', {
        productId: 'product-1',
        sizeId: 'size-1',
        quantity: 1,
      });
      expect(wishlistRepository.removeItem).toHaveBeenCalledWith('user-1', 'wishlist-item-1');
      expect(result.items).toHaveLength(0);
    });

    it('throws NotFoundError when wishlist item does not exist', async () => {
      wishlistRepository.findByUserId.mockResolvedValue({ ...baseWishlist, items: [] });

      await expect(
        service.moveToCart('user-1', 'missing-item', 'size-1', 1),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(cartService.addItem).not.toHaveBeenCalled();
      expect(wishlistRepository.removeItem).not.toHaveBeenCalled();
    });
  });
});
