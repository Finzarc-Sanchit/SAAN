import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type {
  CreateProductInput,
  Product,
  ProductListParams,
  UpdateProductInput,
} from '@/lib/types/product';

const PRODUCTS_BASE = '/api/v1/products';
const ADMIN_PRODUCTS_BASE = '/api/v1/admin/products';

export const productsQueryKeys = {
  all: ['admin', 'products'] as const,
  list: (params: ProductListParams) => [...productsQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...productsQueryKeys.all, 'detail', id] as const,
  storefrontDetail: (slug: string) => ['products', 'storefront', slug] as const,
};

function buildListQuery(params: ProductListParams): string {
  const search = new URLSearchParams();
  if (params.categoryId) search.set('categoryId', params.categoryId);
  if (params.collectionId) search.set('collectionId', params.collectionId);
  if (params.occasion) search.set('occasion', params.occasion);
  if (params.status) search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  if (params.sort) search.set('sort', params.sort);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export type ProductListResult = {
  items: Product[];
  meta: PaginationMeta;
};

export async function listProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const { data, meta } = await apiRequestWithMeta<Product[]>(
    `${PRODUCTS_BASE}${buildListQuery(params)}`,
  );

  return {
    items: data,
    meta: meta ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: data.length,
    },
  };
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  return apiRequest<Product>(`${PRODUCTS_BASE}/${encodeURIComponent(slug)}`);
}

export async function fetchAdminProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`${ADMIN_PRODUCTS_BASE}/${id}`);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  return apiRequest<Product>(PRODUCTS_BASE, {
    method: 'POST',
    body: input,
  });
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  return apiRequest<Product>(`${PRODUCTS_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function archiveProduct(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${PRODUCTS_BASE}/${id}`, {
    method: 'DELETE',
  });
}

export async function adjustProductStock(
  productId: string,
  sizeId: string,
  quantityDelta: number,
): Promise<Product> {
  return apiRequest<Product>(`${PRODUCTS_BASE}/${productId}/sizes/${sizeId}/stock`, {
    method: 'PATCH',
    body: { quantityDelta },
  });
}
