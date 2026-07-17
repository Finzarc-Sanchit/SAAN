import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type { CreateReviewInput, Review, ReviewListParams } from '@/lib/types/review';

const PRODUCTS_BASE = '/api/v1/products';

export const reviewQueryKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewQueryKeys.all, productId] as const,
  list: (productId: string, params: ReviewListParams) =>
    [...reviewQueryKeys.product(productId), 'list', params] as const,
  infinite: (productId: string, params: Omit<ReviewListParams, 'page'>) =>
    [...reviewQueryKeys.product(productId), 'infinite', params] as const,
};

export type ReviewListResult = {
  items: Review[];
  meta: PaginationMeta;
};

function buildReviewQuery(params: ReviewListParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function listProductReviews(
  productId: string,
  params: ReviewListParams = {},
): Promise<ReviewListResult> {
  const { data, meta } = await apiRequestWithMeta<Review[]>(
    `${PRODUCTS_BASE}/${productId}/reviews${buildReviewQuery(params)}`,
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

export async function createProductReview(
  productId: string,
  input: CreateReviewInput,
): Promise<Review> {
  return apiRequest<Review>(`${PRODUCTS_BASE}/${productId}/reviews`, {
    method: 'POST',
    body: input,
    withCsrf: true,
  });
}
