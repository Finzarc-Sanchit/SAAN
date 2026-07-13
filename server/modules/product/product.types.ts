export type ProductStatus = 'draft' | 'active' | 'archived';

export type ProductListSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export interface ProductSize {
  sizeId: string;
  size: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  imageId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface Product {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  categoryId?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: ProductStatus;
  sort?: ProductListSort;
}

export type CreateProductSizeInput = {
  sizeId: string;
  quantity: number;
};

export type ProductSizeWriteInput = {
  sizeId: string;
  size: string;
  quantity: number;
};

export type CreateProductImageInput = {
  imageUrl: string;
  sortOrder: number;
};

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
  sizes: CreateProductSizeInput[];
  images: CreateProductImageInput[];
};

export type ProductRepositoryCreateInput = Omit<CreateProductInput, 'sizes'> & {
  slug: string;
  sizes: ProductSizeWriteInput[];
};

export type ProductRepositoryUpdateInput = Omit<UpdateProductInput, 'sizes'> & {
  slug?: string;
  sizes?: ProductSizeWriteInput[];
};

export type UpdateProductInput = Partial<CreateProductInput>;
