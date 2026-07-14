import { z } from 'zod';

/** Mirrors category list API shape (`CategoryListItem`). */
export type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

/** Mirrors `createCategoryDto` — API accepts name only; slug is server-generated. */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or fewer'),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export type CreateCategoryInput = CategoryFormValues;
export type UpdateCategoryInput = Partial<CategoryFormValues>;
