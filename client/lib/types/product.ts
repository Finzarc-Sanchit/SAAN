import { z } from 'zod';

export type ProductStatus = 'draft' | 'active' | 'archived';

export type ProductListSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

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
  discountId: string | null;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  fabric: string;
  basePrice: number;
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
  status?: ProductStatus;
  search?: string;
  sort?: ProductListSort;
  page?: number;
  limit?: number;
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
  discountId?: string | null;
  name: string;
  description: string;
  shortDescription: string;
  fabric: string;
  basePrice: number;
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

export const productFormSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  discountId: z.string().optional().nullable(),
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().min(1, 'Description is required'),
  shortDescription: z.string().trim().min(1, 'Short description is required').max(500),
  fabric: z.string().trim().min(1, 'Fabric is required').max(200),
  basePrice: z.number().positive('Price must be greater than 0'),
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
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
