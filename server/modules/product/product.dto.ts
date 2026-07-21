import { z } from 'zod';
import { PAGINATION, PRODUCT_OCCASIONS } from '../../shared/constants';
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

const optionalSalePriceSchema = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.number().int('salePrice must be a whole number').positive('salePrice must be greater than 0').nullable(),
);

const optionalDiscountPercentSchema = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z
    .number()
    .int('discountPercent must be a whole number')
    .min(1, 'discountPercent must be at least 1')
    .max(99, 'discountPercent cannot exceed 99')
    .nullable(),
);

const optionalDiscountDateSchema = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.date().nullable(),
);

const productFieldsSchema = z.object({
  categoryId: z.string().min(1, 'categoryId is required'),
  collectionId: z.string().min(1, 'collectionId is required'),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().min(1).max(500),
  fabric: z.string().min(1).max(200),
  color: z.string().min(1, 'color is required').max(100),
  occasion: z
    .array(z.enum(PRODUCT_OCCASIONS))
    .min(1, 'At least one occasion is required')
    .refine((values) => new Set(values).size === values.length, {
      message: 'Occasion values must be unique',
    }),
  fitNotes: z.string().min(1, 'fitNotes is required').max(2000),
  care: z
    .array(z.string().trim().min(1).max(200))
    .min(1, 'At least one care instruction is required')
    .max(20),
  basePrice: z.number().positive('basePrice must be greater than 0'),
  salePrice: optionalSalePriceSchema.optional(),
  discountPercent: optionalDiscountPercentSchema.optional(),
  discountEnabled: z.boolean().default(false),
  discountStartDate: optionalDiscountDateSchema.optional(),
  discountEndDate: optionalDiscountDateSchema.optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  sizes: z.array(productSizeInputSchema).min(1, 'At least one size is required'),
  images: z.array(productImageInputSchema).min(1, 'At least one image is required'),
});

type DiscountFields = {
  basePrice?: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  discountEnabled?: boolean;
  discountStartDate?: Date | null;
  discountEndDate?: Date | null;
};

function withDiscountValidation<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine(
    (data: DiscountFields, ctx: z.RefinementCtx) => {
      if (data.salePrice != null && data.basePrice != null && data.salePrice >= data.basePrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'salePrice must be less than basePrice',
          path: ['salePrice'],
        });
      }

      if (data.discountEnabled === true) {
        if (data.salePrice == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'salePrice is required when discount is enabled',
            path: ['salePrice'],
          });
        }
        if (data.discountPercent == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'discountPercent is required when discount is enabled',
            path: ['discountPercent'],
          });
        }
        if (!data.discountStartDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'discountStartDate is required when discount is enabled',
            path: ['discountStartDate'],
          });
        }
        if (!data.discountEndDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'discountEndDate is required when discount is enabled',
            path: ['discountEndDate'],
          });
        }
      }

      if (
        data.discountStartDate &&
        data.discountEndDate &&
        data.discountEndDate <= data.discountStartDate
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'discountEndDate must be after discountStartDate',
          path: ['discountEndDate'],
        });
      }
    },
  );
}

export const createProductDto = withDiscountValidation(productFieldsSchema);

export const updateProductDto = withDiscountValidation(productFieldsSchema.partial());

export const productFilterDto = z.object({
  categoryId: z.string().min(1).optional(),
  collectionId: z.string().min(1).optional(),
  size: z.string().min(1).optional(),
  occasion: z.enum(PRODUCT_OCCASIONS).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().min(1).max(200).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).optional(),
  offset: z.coerce.number().int().min(0).optional(),
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
