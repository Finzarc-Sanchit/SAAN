import type { ICategoryRepository } from '../category/category.repository.interface';
import type { ICollectionRepository } from '../collection/collection.repository.interface';
import type { ISizeRepository } from '../size/size.repository.interface';
import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { ValidationError } from '../../shared/errors/validation-error';
import { resolveUniqueSlug } from '../../shared/utils/slug';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import type { IProductRepository } from './product.repository.interface';
import {
  computeDiscountPercentFromSalePrice,
  computeEffectivePrice,
} from './product.pricing';
import type {
  CreateProductInput,
  CreateProductSizeInput,
  Product,
  ProductFilter,
  ProductRepositoryUpdateInput,
  ProductSizeWriteInput,
  UpdateProductInput,
} from './product.types';

export { computeEffectivePrice } from './product.pricing';

type ListProductsOptions = {
  includeAllStatuses?: boolean;
};

export class ProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly sizeRepository: ISizeRepository,
    private readonly collectionRepository: ICollectionRepository,
  ) {}

  async createProduct(input: CreateProductInput): Promise<Product> {
    await this.assertCategoryExists(input.categoryId);
    await this.assertCollectionExists(input.collectionId);
    const discountEnabled = input.discountEnabled ?? false;
    const salePrice = input.salePrice ?? null;
    const discountPercent =
      discountEnabled && salePrice != null
        ? computeDiscountPercentFromSalePrice(input.basePrice, salePrice)
        : null;
    this.assertValidDiscountConfiguration({
      basePrice: input.basePrice,
      salePrice,
      discountPercent,
      discountEnabled,
      discountStartDate: input.discountStartDate ?? null,
      discountEndDate: input.discountEndDate ?? null,
    });

    const slug = await resolveUniqueSlug(input.name, (candidate) =>
      this.productRepository.slugExists(candidate),
    );
    const sizes = await this.resolveProductSizes(input.sizes);

    return this.productRepository.create({
      ...input,
      salePrice,
      discountPercent,
      discountEnabled,
      discountStartDate: input.discountStartDate ?? null,
      discountEndDate: input.discountEndDate ?? null,
      slug,
      sizes,
    });
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (input.categoryId) {
      await this.assertCategoryExists(input.categoryId);
    }

    if (input.collectionId) {
      await this.assertCollectionExists(input.collectionId);
    }

    const { sizes: sizeInputs, ...rest } = input;
    const updatePayload: ProductRepositoryUpdateInput = { ...rest };
    const basePrice = input.basePrice ?? existing.basePrice;
    const salePrice = input.salePrice !== undefined ? input.salePrice : existing.salePrice;
    const discountEnabled = input.discountEnabled ?? existing.discountEnabled;
    const discountPercent =
      discountEnabled && salePrice != null
        ? computeDiscountPercentFromSalePrice(basePrice, salePrice)
        : null;
    updatePayload.discountPercent = discountPercent;
    this.assertValidDiscountConfiguration({
      basePrice,
      salePrice,
      discountPercent,
      discountEnabled,
      discountStartDate:
        input.discountStartDate !== undefined
          ? input.discountStartDate
          : existing.discountStartDate,
      discountEndDate:
        input.discountEndDate !== undefined ? input.discountEndDate : existing.discountEndDate,
    });

    if (input.name) {
      updatePayload.slug = await resolveUniqueSlug(input.name, (candidate) =>
        this.productRepository.slugExists(candidate, id),
      );
    }

    if (sizeInputs) {
      updatePayload.sizes = await this.resolveProductSizes(sizeInputs);
    }

    return this.productRepository.update(id, updatePayload);
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug);

    if (!product || product.status !== 'active') {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async listProducts(
    filter: ProductFilter,
    pagination: Pagination,
    options: ListProductsOptions = {},
  ): Promise<Paginated<Product>> {
    const effectiveFilter: ProductFilter = options.includeAllStatuses
      ? filter
      : { ...filter, status: 'active' };

    return this.productRepository.findMany(effectiveFilter, pagination);
  }

  async archiveProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await this.productRepository.archive(id);
  }

  async adjustStock(productId: string, sizeId: string, quantityDelta: number): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const size = product.sizes.find((item) => item.sizeId === sizeId);
    if (!size) {
      throw new NotFoundError('Size not found');
    }

    const applied = await this.productRepository.adjustSizeStock(
      productId,
      sizeId,
      quantityDelta,
    );

    if (!applied) {
      throw new InsufficientStockError(
        `Insufficient stock for size ${size.size}`,
        [{ field: 'quantityDelta', message: 'Quantity cannot go below zero' }],
      );
    }

    return this.getProductById(productId);
  }

  async computeEffectivePrice(product: Product): Promise<number> {
    return computeEffectivePrice(product);
  }

  private async resolveProductSizes(
    sizes: CreateProductSizeInput[],
  ): Promise<ProductSizeWriteInput[]> {
    const sizeIds = sizes.map((entry) => entry.sizeId);
    const uniqueSizeIds = new Set(sizeIds);

    if (uniqueSizeIds.size !== sizeIds.length) {
      throw new ValidationError('Each sizeId can only appear once per product', [
        { field: 'sizes', message: 'Duplicate sizeId values are not allowed' },
      ]);
    }

    const catalogSizes = await this.sizeRepository.findBySizeIds(sizeIds);
    const catalogBySizeId = new Map(catalogSizes.map((entry) => [entry.sizeId, entry]));

    return sizes.map((entry) => {
      const catalogSize = catalogBySizeId.get(entry.sizeId);
      if (!catalogSize) {
        throw new NotFoundError(`Size ${entry.sizeId} not found`);
      }

      return {
        sizeId: catalogSize.sizeId,
        size: catalogSize.label,
        quantity: entry.quantity,
      };
    });
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
  }

  private async assertCollectionExists(collectionId: string): Promise<void> {
    const collection = await this.collectionRepository.findById(collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
  }

  private assertValidDiscountConfiguration(config: {
    basePrice: number;
    salePrice: number | null;
    discountPercent: number | null;
    discountEnabled: boolean;
    discountStartDate: Date | null;
    discountEndDate: Date | null;
  }): void {
    if (!config.discountEnabled) return;

    const errors: Array<{ field: string; message: string }> = [];
    if (config.salePrice == null || config.salePrice <= 0 || config.salePrice >= config.basePrice) {
      errors.push({ field: 'salePrice', message: 'Sale price must be less than base price' });
    }
    if (
      config.discountPercent == null ||
      config.discountPercent < 1 ||
      config.discountPercent > 99
    ) {
      errors.push({ field: 'discountPercent', message: 'Discount must be between 1% and 99%' });
    }
    if (!config.discountStartDate) {
      errors.push({ field: 'discountStartDate', message: 'Discount start date is required' });
    }
    if (!config.discountEndDate) {
      errors.push({ field: 'discountEndDate', message: 'Discount end date is required' });
    }
    if (
      config.discountStartDate &&
      config.discountEndDate &&
      config.discountEndDate <= config.discountStartDate
    ) {
      errors.push({ field: 'discountEndDate', message: 'End date must be after start date' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Invalid discount configuration', errors);
    }
  }
}
