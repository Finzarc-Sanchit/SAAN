import { NotFoundError } from '../../shared/errors/not-found-error';
import { resolveUniqueSlug } from '../../shared/utils/slug';
import type { ICategoryRepository } from './category.repository.interface';
import type {
  Category,
  CategoryListItem,
  CategoryRepositoryUpdateInput,
  CreateCategoryInput,
} from './category.types';

export class CategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async listCategories(): Promise<CategoryListItem[]> {
    return this.categoryRepository.findMany();
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = await resolveUniqueSlug(input.name, (candidate) =>
      this.categoryRepository.slugExists(candidate),
    );

    return this.categoryRepository.create({ ...input, slug });
  }

  async updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    const updatePayload: CategoryRepositoryUpdateInput = { ...input };

    if (input.name) {
      updatePayload.slug = await resolveUniqueSlug(input.name, (candidate) =>
        this.categoryRepository.slugExists(candidate, id),
      );
    }

    return this.categoryRepository.update(id, updatePayload);
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }
}
