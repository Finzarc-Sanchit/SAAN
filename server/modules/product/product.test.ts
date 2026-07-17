import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import type { ICategoryRepository } from '../category/category.repository.interface';
import type { ICollectionRepository } from '../collection/collection.repository.interface';
import type { Collection } from '../collection/collection.types';
import type { ISizeRepository } from '../size/size.repository.interface';
import type { IProductRepository } from './product.repository.interface';
import { computeEffectivePrice, ProductService } from './product.service';
import type { CreateProductInput, Product } from './product.types';

const baseProduct: Product = {
  id: 'product-1',
  categoryId: 'cat-1',
  collectionId: 'collection-1',
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
  salePrice: 4000,
  discountPercent: 20,
  discountEnabled: true,
  discountStartDate: new Date('2026-01-01'),
  discountEndDate: new Date('2027-01-01'),
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
  collectionId: 'collection-1',
  name: baseProduct.name,
  description: baseProduct.description,
  shortDescription: baseProduct.shortDescription,
  fabric: baseProduct.fabric,
  color: baseProduct.color,
  occasion: baseProduct.occasion,
  fitNotes: baseProduct.fitNotes,
  care: baseProduct.care,
  basePrice: baseProduct.basePrice,
  salePrice: baseProduct.salePrice,
  discountPercent: baseProduct.discountPercent,
  discountEnabled: baseProduct.discountEnabled,
  discountStartDate: baseProduct.discountStartDate,
  discountEndDate: baseProduct.discountEndDate,
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

const baseCollection: Collection = {
  id: 'collection-1',
  slug: 'summer-edit',
  title: 'Summer Edit',
  description: 'A light seasonal edit.',
  tagline: 'Made for long days.',
  imageUrl: 'https://example.com/summer-edit.jpg',
  imageAlt: 'Summer Edit',
  status: 'published',
  sortOrder: 0,
  featured: true,
  productCount: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
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

function createCollectionRepositoryMock(): jest.Mocked<ICollectionRepository> {
  return {
    findById: jest.fn(),
    findByIds: jest.fn(),
    findPublishedBySlug: jest.fn(),
    findMany: jest.fn(),
    findPublished: jest.fn(),
    slugExists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    isCollectionInUse: jest.fn(),
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
  it('returns basePrice when no sale price is set', () => {
    expect(
      computeEffectivePrice({
        basePrice: 5000,
        salePrice: null,
        discountPercent: null,
        discountEnabled: false,
        discountStartDate: null,
        discountEndDate: null,
      }),
    ).toBe(5000);
  });

  it('returns sale price while the discount is active', () => {
    expect(
      computeEffectivePrice(
        {
          basePrice: 5000,
          salePrice: 4000,
          discountPercent: 20,
          discountEnabled: true,
          discountStartDate: new Date('2026-01-01'),
          discountEndDate: new Date('2026-12-31'),
        },
        new Date('2026-06-01'),
      ),
    ).toBe(4000);
  });

  it('returns base price outside the configured discount window', () => {
    const product = {
      basePrice: 5000,
      salePrice: 4000,
      discountPercent: 20,
      discountEnabled: true,
      discountStartDate: new Date('2026-01-01'),
      discountEndDate: new Date('2026-03-01'),
    };
    expect(computeEffectivePrice(product, new Date('2025-12-31'))).toBe(5000);
    expect(computeEffectivePrice(product, new Date('2026-03-01'))).toBe(5000);
  });
});

describe('ProductService', () => {
  let productRepository: jest.Mocked<IProductRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;
  let sizeRepository: jest.Mocked<ISizeRepository>;
  let collectionRepository: jest.Mocked<ICollectionRepository>;
  let service: ProductService;

  beforeEach(() => {
    productRepository = createProductRepositoryMock();
    categoryRepository = createCategoryRepositoryMock();
    sizeRepository = createSizeRepositoryMock();
    collectionRepository = createCollectionRepositoryMock();
    productRepository.slugExists.mockResolvedValue(false);
    collectionRepository.findById.mockResolvedValue(baseCollection);
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
      sizeRepository,
      collectionRepository,
    );
  });

  it('createProduct throws NotFoundError when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(service.createProduct(createInput)).rejects.toBeInstanceOf(NotFoundError);
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it('createProduct succeeds without a sale price', async () => {
    categoryRepository.findById.mockResolvedValue({ id: 'cat-1', name: 'Linen', slug: 'linen' });
    productRepository.create.mockResolvedValue({
      ...baseProduct,
      salePrice: null,
      discountPercent: null,
      discountEnabled: false,
    });

    const inputWithoutSale: CreateProductInput = {
      ...createInput,
      salePrice: null,
      discountPercent: null,
      discountEnabled: false,
      discountStartDate: null,
      discountEndDate: null,
    };
    await service.createProduct(inputWithoutSale);

    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        salePrice: null,
        discountPercent: null,
        slug: 'linen-shirt',
      }),
    );
  });

  it('createProduct auto-generates a unique slug when the base slug is taken', async () => {
    categoryRepository.findById.mockResolvedValue({ id: 'cat-1', name: 'Linen', slug: 'linen' });
    productRepository.slugExists.mockImplementation(async (slug) => slug === 'linen-shirt');
    productRepository.create.mockResolvedValue(baseProduct);

    await service.createProduct(createInput);

    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'linen-shirt-2',
        salePrice: 4000,
        discountPercent: 20,
        sizes: [
          { sizeId: '400000000001', size: 'S', quantity: 5 },
          { sizeId: '400000000002', size: 'M', quantity: 10 },
        ],
      }),
    );
  });

  it('validates and persists collection membership when creating a product', async () => {
    categoryRepository.findById.mockResolvedValue({ id: 'cat-1', name: 'Linen', slug: 'linen' });
    collectionRepository.findById.mockResolvedValue(baseCollection);
    productRepository.create.mockResolvedValue(baseProduct);

    await service.createProduct(createInput);

    expect(collectionRepository.findById).toHaveBeenCalledWith(baseCollection.id);
    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ collectionId: baseCollection.id }),
    );
  });

  it('rejects unknown collection membership', async () => {
    categoryRepository.findById.mockResolvedValue({ id: 'cat-1', name: 'Linen', slug: 'linen' });
    collectionRepository.findById.mockResolvedValue(null);

    await expect(
      service.createProduct({ ...createInput, collectionId: 'missing-collection' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(productRepository.create).not.toHaveBeenCalled();
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

  it('computeEffectivePrice returns sale price from product', async () => {
    const price = await service.computeEffectivePrice(baseProduct);
    expect(price).toBe(4000);
  });

  it('computeEffectivePrice returns basePrice when product has no sale price', async () => {
    const price = await service.computeEffectivePrice({
      ...baseProduct,
      salePrice: null,
      discountPercent: null,
      discountEnabled: false,
    });
    expect(price).toBe(5000);
  });
});
