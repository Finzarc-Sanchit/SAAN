import { apiRequest } from '@/lib/api/client';
import type { Collection } from '@/lib/types/collection';

const COLLECTIONS_BASE = '/api/v1/collections';

export const storefrontCollectionsQueryKeys = {
  all: ['collections', 'storefront'] as const,
  detail: (slug: string) => [...storefrontCollectionsQueryKeys.all, slug] as const,
};

export async function fetchStorefrontCollectionBySlug(slug: string): Promise<Collection> {
  return apiRequest<Collection>(`${COLLECTIONS_BASE}/${encodeURIComponent(slug)}`);
}
