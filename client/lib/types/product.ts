import { z } from 'zod';
import { PRODUCT_OCCASIONS, type ProductOccasion } from '@/lib/product-occasion';

export type ProductStatus = 'draft' | 'active' | 'archived';

export type ProductListSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export type { ProductOccasion };

export type ProductSize = {
  sizeId: string;
  size: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  imageId: string;
  imageUrl: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  categoryId: string;
  collectionId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  fabric: string;
  color: string;
  occasion: ProductOccasion[];
  fitNotes: string;
  care: string[];
  basePrice: number;
  salePrice: number | null;
  discountPercent: number | null;
  discountEnabled: boolean;
  discountStartDate: string | null;
  discountEndDate: string | null;
  ratingsAverage: number;
  ratingsCount: number;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  sizes: ProductSize[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListParams = {
  categoryId?: string;
  collectionId?: string;
  occasion?: ProductOccasion;
  status?: ProductStatus;
  search?: string;
  sort?: ProductListSort;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  offset?: number;
};

export type ProductSizeInput = {
  sizeId: string;
  quantity: number;
};

export type ProductImageInput = {
  imageUrl: string;
  sortOrder: number;
};

/** Mirrors createProductDto (slug is server-generated from name). */
export type CreateProductInput = {
  categoryId: string;
  collectionId: string;
  name: string;
  description: string;
  shortDescription: string;
  fabric: string;
  color: string;
  occasion: ProductOccasion[];
  fitNotes: string;
  care: string[];
  basePrice: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  discountEnabled?: boolean;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  sizes: ProductSizeInput[];
  images: ProductImageInput[];
};

export type UpdateProductInput = Partial<CreateProductInput>;

const sizeIdSchema = z
  .string()
  .min(1, 'Size is required')
  .regex(/^4580871\d{5}$/, 'Invalid size selection');

export const productFormSchema = z
  .object({
    categoryId: z.string().min(1, 'Category is required'),
    collectionId: z.string().min(1, 'Collection is required'),
    name: z.string().trim().min(1, 'Name is required').max(200),
    description: z.string().trim().min(1, 'Description is required'),
    shortDescription: z.string().trim().min(1, 'Short description is required').max(500),
    fabric: z.string().trim().min(1, 'Fabric is required').max(200),
    color: z.string().trim().min(1, 'Colour is required').max(100),
    occasion: z
      .array(z.enum(PRODUCT_OCCASIONS))
      .min(1, 'Select at least one occasion')
      .refine((values) => new Set(values).size === values.length, {
        message: 'Occasion values must be unique',
      }),
    fitNotes: z.string().trim().min(1, 'Comfort & fit notes are required').max(2000),
    care: z
      .array(z.string().trim().min(1).max(200))
      .min(1, 'Add at least one care instruction')
      .max(20),
    basePrice: z.number().positive('Price must be greater than 0'),
    salePrice: z
      .number()
      .int('Sale price must be a whole number')
      .positive('Sale price must be greater than 0')
      .nullable()
      .optional(),
    discountPercent: z
      .number()
      .int('Discount must be a whole number')
      .min(1, 'Discount must be at least 1%')
      .max(99, 'Discount cannot exceed 99%')
      .nullable()
      .optional(),
    discountEnabled: z.boolean(),
    discountStartDate: z.string().datetime().nullable().optional(),
    discountEndDate: z.string().datetime().nullable().optional(),
    status: z.enum(['draft', 'active', 'archived']),
    isFeatured: z.boolean(),
    isNewArrival: z.boolean(),
    isBestSeller: z.boolean(),
    sizes: z
      .array(
        z.object({
          sizeId: sizeIdSchema,
          quantity: z.number().int().min(0, 'Quantity cannot be negative'),
        }),
      )
      .min(1, 'At least one size is required'),
    images: z
      .array(
        z.object({
          imageUrl: z.string().url('Image URL must be valid'),
          sortOrder: z.number().int().min(0),
        }),
      )
      .min(1, 'At least one image is required'),
  })
  .superRefine((data, ctx) => {
    if (data.salePrice != null && data.salePrice >= data.basePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale price must be less than base price',
        path: ['salePrice'],
      });
    }
    if (data.discountEnabled && data.salePrice == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sale price is required when discount is enabled',
        path: ['salePrice'],
      });
    }
    if (data.discountEnabled && data.discountPercent == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Discount percentage is required when discount is enabled',
        path: ['discountPercent'],
      });
    }
    if (data.discountEnabled && !data.discountStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date is required when discount is enabled',
        path: ['discountStartDate'],
      });
    }
    if (data.discountEnabled && !data.discountEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is required when discount is enabled',
        path: ['discountEndDate'],
      });
    }
    if (
      data.discountStartDate &&
      data.discountEndDate &&
      new Date(data.discountEndDate) <= new Date(data.discountStartDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['discountEndDate'],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const DEFAULT_PRODUCT_CARE = [
  'Dry Clean Only',
  'Do not Wash',
  'Do not Wring',
  'Iron at low temperature',
  'Tumble dry on Low Heat',
] as const;

export function parseCareTextarea(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatCareTextarea(care: string[]): string {
  return care.join('\n');
}
