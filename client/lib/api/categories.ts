import { apiRequest } from '@/lib/api/client';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/lib/types/category';

const CATEGORIES_BASE = '/api/v1/categories';

export const categoriesQueryKeys = {
  all: ['admin', 'categories'] as const,
  list: () => [...categoriesQueryKeys.all] as const,
};

export async function listCategories(): Promise<Category[]> {
  return apiRequest<Category[]>(CATEGORIES_BASE);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  return apiRequest<Category>(CATEGORIES_BASE, {
    method: 'POST',
    body: input,
  });
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  return apiRequest<Category>(`${CATEGORIES_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}
