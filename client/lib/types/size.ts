import { z } from 'zod';

/** Mirrors `server/modules/size/size.types.ts` `GarmentSize` API shape. */
export type GarmentSize = {
  id: string;
  sizeId: string;
  label: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const labelSchema = z
  .string()
  .trim()
  .min(1, 'Label is required')
  .max(32, 'Label is too long')
  .regex(/^[A-Za-z0-9]+$/, 'Label must be alphanumeric');

/** Mirrors `createSizeDto` / `updateSizeDto`. */
export const sizeFormSchema = z.object({
  label: labelSchema,
  sortOrder: z
    .number({ invalid_type_error: 'Sort order must be a number' })
    .int('Sort order must be a whole number')
    .min(0, 'Sort order cannot be negative')
    .optional(),
});

export type SizeFormValues = z.infer<typeof sizeFormSchema>;

export type CreateSizeInput = {
  label: string;
  sortOrder?: number;
};

export type UpdateSizeInput = {
  label?: string;
  sortOrder?: number;
};
