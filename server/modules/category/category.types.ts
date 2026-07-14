export interface Category {
  id: string;
  name: string;
  slug: string;
}

/** List payload includes product totals for admin catalog tables. */
export type CategoryListItem = Category & {
  productCount: number;
};

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
