import type {
  Category,
  CategoryListItem,
  CategoryRepositoryCreateInput,
  CategoryRepositoryUpdateInput,
} from './category.types';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findMany(): Promise<CategoryListItem[]>;
  create(data: CategoryRepositoryCreateInput): Promise<Category>;
  update(id: string, data: CategoryRepositoryUpdateInput): Promise<Category>;
  slugExists(slug: string, excludeCategoryId?: string): Promise<boolean>;
}
