import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  Product,
  ProductFilter,
  ProductRepositoryCreateInput,
  ProductRepositoryUpdateInput,
} from './product.types';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filter: ProductFilter, pagination: Pagination): Promise<Paginated<Product>>;
  create(data: ProductRepositoryCreateInput): Promise<Product>;
  update(id: string, data: ProductRepositoryUpdateInput): Promise<Product>;
  archive(id: string): Promise<void>;
  adjustSizeStock(productId: string, sizeId: string, quantityDelta: number): Promise<boolean>;
  findByIds(ids: string[]): Promise<Product[]>;
  slugExists(slug: string, excludeProductId?: string): Promise<boolean>;
  updateRatings(
    id: string,
    ratings: { ratingsAverage: number; ratingsCount: number },
  ): Promise<void>;
}
