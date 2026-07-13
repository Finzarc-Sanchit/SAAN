import type { ICategoryRepository } from '../category/category.repository.interface';
import type { IDiscountRepository } from '../discount/discount.repository.interface';
import type { ISizeRepository } from '../size/size.repository.interface';
import { InsufficientStockError } from '../../shared/errors/insufficient-stock-error';
import { NotFoundError } from '../../shared/errors/not-found-error';
import { ValidationError } from '../../shared/errors/validation-error';
import { resolveUniqueSlug } from '../../shared/utils/slug';
import type { Paginated, Pagination } from '../../shared/types/pagination';
import type { IProductRepository } from './product.repository.interface';
import { computeEffectivePrice } from './product.pricing';
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
    private readonly discountRepository: IDiscountRepository,
    private readonly sizeRepository: ISizeRepository,
  ) {}

  async createProduct(input: CreateProductInput): Promise<Product> {
    await this.assertCategoryExists(input.categoryId);
    await this.assertDiscountExistsIfProvided(input.discountId);

    const slug = await resolveUniqueSlug(input.name, (candidate) =>
      this.productRepository.slugExists(candidate),
    );
    const sizes = await this.resolveProductSizes(input.sizes);

    return this.productRepository.create({
      ...input,
      discountId: input.discountId ?? null,
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

    if (input.discountId !== undefined) {
      await this.assertDiscountExistsIfProvided(input.discountId);
    }

    const { sizes: sizeInputs, ...rest } = input;
    const updatePayload: ProductRepositoryUpdateInput = { ...rest };

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

  async computeEffectivePrice(product: Product, at: Date = new Date()): Promise<number> {
    if (!product.discountId) {
      return computeEffectivePrice(product.basePrice, null, at);
    }

    const discount = await this.discountRepository.findById(product.discountId);
    return computeEffectivePrice(product.basePrice, discount, at);
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

  private async assertDiscountExistsIfProvided(discountId?: string | null): Promise<void> {
    if (!discountId) {
      return;
    }

    const discount = await this.discountRepository.findById(discountId);
    if (!discount) {
      throw new NotFoundError('Discount not found');
    }
  }
}
