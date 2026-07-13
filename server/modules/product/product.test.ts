import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { ICategoryRepository } from '../category/category.repository.interface';
import type { IDiscountRepository } from '../discount/discount.repository.interface';
import type { ISizeRepository } from '../size/size.repository.interface';
import type { IProductRepository } from './product.repository.interface';
import { computeEffectivePrice, ProductService } from './product.service';
import type { CreateProductInput, Product } from './product.types';

const baseProduct: Product = {
  id: 'product-1',
  categoryId: 'cat-1',
  discountId: 'discount-1',
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
      sizeId: '400000000001',
      size: 'S',
      quantity: 5,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
    {
      sizeId: '400000000002',
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

const createInput: CreateProductInput = {
  categoryId: 'cat-1',
  discountId: 'discount-1',
  name: baseProduct.name,
  description: baseProduct.description,
  shortDescription: baseProduct.shortDescription,
  fabric: baseProduct.fabric,
  basePrice: baseProduct.basePrice,
  status: 'draft',
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  sizes: [
    { sizeId: '400000000001', quantity: 5 },
    { sizeId: '400000000002', quantity: 10 },
  ],
  images: [{ imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
};

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

function createCategoryRepositoryMock(): jest.Mocked<ICategoryRepository> {
  return {
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    slugExists: jest.fn(),
  };
}

function createDiscountRepositoryMock(): jest.Mocked<IDiscountRepository> {
  return {
    findById: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function createSizeRepositoryMock(): jest.Mocked<ISizeRepository> {
  return {
    findById: jest.fn(),
    findBySizeId: jest.fn(),
    findByLabel: jest.fn(),
    findMany: jest.fn(),
    findBySizeIds: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    sizeIdExists: jest.fn(),
    labelExists: jest.fn(),
    isSizeInUse: jest.fn(),
  };
}

describe('computeEffectivePrice', () => {
  it('returns basePrice when no discount is provided', () => {
    expect(computeEffectivePrice(5000, null)).toBe(5000);
  });

  it('applies active percentage discount', () => {
    expect(
      computeEffectivePrice(
        5000,
        {
          type: 'percentage',
          value: 10,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
        },
        new Date('2026-06-01'),
      ),
    ).toBe(4500);
  });

  it('applies active flat discount without going below zero', () => {
    expect(
      computeEffectivePrice(
        5000,
        {
          type: 'flat',
          value: 6000,
          validFrom: new Date('2026-01-01'),
          validTo: new Date('2026-12-31'),
        },
        new Date('2026-06-01'),
      ),
    ).toBe(0);
  });

  it('ignores expired discounts', () => {
    expect(
      computeEffectivePrice(
        5000,
        {
          type: 'percentage',
          value: 50,
          validFrom: new Date('2025-01-01'),
          validTo: new Date('2025-12-31'),
        },
        new Date('2026-06-01'),
      ),
    ).toBe(5000);
  });
});

describe('ProductService', () => {
  let productRepository: jest.Mocked<IProductRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;
  let discountRepository: jest.Mocked<IDiscountRepository>;
  let sizeRepository: jest.Mocked<ISizeRepository>;
  let service: ProductService;

  beforeEach(() => {
    productRepository = createProductRepositoryMock();
    categoryRepository = createCategoryRepositoryMock();
    discountRepository = createDiscountRepositoryMock();
    sizeRepository = createSizeRepositoryMock();
    productRepository.slugExists.mockResolvedValue(false);
    sizeRepository.findBySizeIds.mockResolvedValue([
      {
        id: 'size-1',
        sizeId: '400000000001',
        label: 'S',
        sortOrder: 0,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        id: 'size-2',
        sizeId: '400000000002',
        label: 'M',
        sortOrder: 1,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    ]);
    service = new ProductService(
      productRepository,
      categoryRepository,
      discountRepository,
      sizeRepository,
    );
  });

  it('createProduct throws NotFoundError when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(service.createProduct(createInput)).rejects.toBeInstanceOf(NotFoundError);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('createProduct succeeds without a discountId', async () => {
    categoryRepository.findById.mockResolvedValue({ id: 'cat-1', name: 'Linen', slug: 'linen' });
    productRepository.create.mockResolvedValue({ ...baseProduct, discountId: null });

    const { discountId: _discountId, ...inputWithoutDiscount } = createInput;
    await service.createProduct(inputWithoutDiscount);

    expect(discountRepository.findById).not.toHaveBeenCalled();
    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        discountId: null,
        slug: 'linen-shirt',
      }),
    );
  });

  it('createProduct throws NotFoundError when discount does not exist', async () => {
    categoryRepository.findById.mockResolvedValue({ id: 'cat-1', name: 'Linen', slug: 'linen' });
    discountRepository.findById.mockResolvedValue(null);

    await expect(service.createProduct(createInput)).rejects.toBeInstanceOf(NotFoundError);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('createProduct auto-generates a unique slug when the base slug is taken', async () => {
    categoryRepository.findById.mockResolvedValue({ id: 'cat-1', name: 'Linen', slug: 'linen' });
    discountRepository.findById.mockResolvedValue({
      id: 'discount-1',
      type: 'percentage',
      value: 10,
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2026-12-31'),
    });
    productRepository.slugExists.mockImplementation(async (slug) => slug === 'linen-shirt');
    productRepository.create.mockResolvedValue(baseProduct);

    await service.createProduct(createInput);

    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'linen-shirt-2',
        sizes: [
          { sizeId: '400000000001', size: 'S', quantity: 5 },
          { sizeId: '400000000002', size: 'M', quantity: 10 },
        ],
      }),
    );
  });

  it('getProductBySlug throws NotFoundError for draft products', async () => {
    productRepository.findBySlug.mockResolvedValue({ ...baseProduct, status: 'draft' });

    await expect(service.getProductBySlug('linen-shirt')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('listProducts forces active status for public callers', async () => {
    productRepository.findMany.mockResolvedValue({
      items: [baseProduct],
      page: 1,
      limit: 20,
      total: 1,
    });

    await service.listProducts({ status: 'draft' }, { page: 1, limit: 20 });

    expect(productRepository.findMany).toHaveBeenCalledWith(
      { status: 'active' },
      { page: 1, limit: 20 },
    );
  });

  it('adjustStock throws InsufficientStockError when repository update does not apply', async () => {
    productRepository.findById.mockResolvedValue(baseProduct);
    productRepository.adjustSizeStock.mockResolvedValue(false);

    await expect(service.adjustStock('product-1', '400000000001', -20)).rejects.toBeInstanceOf(
      InsufficientStockError,
    );
  });

  it('computeEffectivePrice fetches referenced discount for active campaigns', async () => {
    discountRepository.findById.mockResolvedValue({
      id: 'discount-1',
      type: 'percentage',
      value: 20,
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2026-12-31'),
    });

    const price = await service.computeEffectivePrice(baseProduct, new Date('2026-06-01'));
    expect(price).toBe(4000);
  });

  it('computeEffectivePrice returns basePrice when product has no discountId', async () => {
    const price = await service.computeEffectivePrice(
      { ...baseProduct, discountId: null },
      new Date('2026-06-01'),
    );
    expect(price).toBe(5000);
    expect(discountRepository.findById).not.toHaveBeenCalled();
  });
});
