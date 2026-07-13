import { z } from 'zod';

export const createSizeDto = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(32, 'Label is too long')
    .regex(/^[A-Za-z0-9]+$/, 'Label must be alphanumeric'),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateSizeDto = z
  .object({
    label: z
      .string()
      .trim()
      .min(1)
      .max(32)
      .regex(/^[A-Za-z0-9]+$/, 'Label must be alphanumeric')
      .optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const sizeIdParamsDto = z.object({
  id: z.string().min(1),
});

export type CreateSizeDto = z.infer<typeof createSizeDto>;
export type UpdateSizeDto = z.infer<typeof updateSizeDto>;
