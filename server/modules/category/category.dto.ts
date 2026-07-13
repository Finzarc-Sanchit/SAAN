import { z } from 'zod';

export const createCategoryDto = z.object({
  name: z.string().min(1).max(200),
});

export const updateCategoryDto = createCategoryDto.partial();

export const categoryIdParamsDto = z.object({
  id: z.string().min(1),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDto>;
