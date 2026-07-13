import { z } from 'zod';
import { PAGINATION } from '../../shared/constants';
import { SIZE_ID_LENGTH, SIZE_ID_PREFIX } from '../../shared/constants/size-id';

const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');

const sizeIdSchema = z
  .string()
  .length(SIZE_ID_LENGTH, `sizeId must be ${SIZE_ID_LENGTH} digits`)
  .regex(
    new RegExp(`^${SIZE_ID_PREFIX}\\d{${SIZE_ID_LENGTH - SIZE_ID_PREFIX.length}}$`),
    'Invalid sizeId format',
  );

const productSizeInputSchema = z.object({
  sizeId: sizeIdSchema,
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

const productImageInputSchema = z.object({
  imageUrl: z.string().url('imageUrl must be a valid URL'),
  sortOrder: z.number().int().min(0),
});

const optionalDiscountIdSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1, 'discountId must be a valid ID').nullish(),
);

const productBaseSchema = z.object({
  categoryId: z.string().min(1, 'categoryId is required'),
  discountId: optionalDiscountIdSchema,
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().min(1).max(500),
  fabric: z.string().min(1).max(200),
  basePrice: z.number().positive('basePrice must be greater than 0'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  sizes: z.array(productSizeInputSchema).min(1, 'At least one size is required'),
  images: z.array(productImageInputSchema).min(1, 'At least one image is required'),
});

export const createProductDto = productBaseSchema;

export const updateProductDto = productBaseSchema.partial();

export const productFilterDto = z.object({
  categoryId: z.string().min(1).optional(),
  size: z.string().min(1).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().min(1).max(200).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).optional(),
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export const productIdParamsDto = z.object({
  id: z.string().min(1),
});

export const productSlugParamsDto = z.object({
  slug: slugSchema,
});

export const adjustStockParamsDto = z.object({
  id: z.string().min(1),
  sizeId: z.string().min(1),
});

export const adjustStockBodyDto = z.object({
  quantityDelta: z.number().int().refine((value) => value !== 0, 'quantityDelta cannot be zero'),
});

export type CreateProductDto = z.infer<typeof createProductDto>;
export type UpdateProductDto = z.infer<typeof updateProductDto>;
export type ProductFilterDto = z.infer<typeof productFilterDto>;
