export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type CreateCategoryInput = {
  name: string;
};

export type CategoryRepositoryCreateInput = CreateCategoryInput & {
  slug: string;
};

export type CategoryRepositoryUpdateInput = UpdateCategoryInput & {
  slug?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
