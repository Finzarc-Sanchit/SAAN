import { apiRequest } from '@/lib/api/client';
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@/lib/types/collection';

const COLLECTIONS_BASE = '/api/v1/admin/collections';

export const collectionsQueryKeys = {
  all: ['admin', 'collections'] as const,
  list: () => [...collectionsQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...collectionsQueryKeys.all, 'detail', id] as const,
};

export async function listCollections(): Promise<Collection[]> {
  return apiRequest<Collection[]>(COLLECTIONS_BASE);
}

export async function getCollection(id: string): Promise<Collection> {
  return apiRequest<Collection>(`${COLLECTIONS_BASE}/${id}`);
}

export async function createCollection(input: CreateCollectionInput): Promise<Collection> {
  return apiRequest<Collection>(COLLECTIONS_BASE, {
    method: 'POST',
    body: input,
  });
}

export async function updateCollection(
  id: string,
  input: UpdateCollectionInput,
): Promise<Collection> {
  return apiRequest<Collection>(`${COLLECTIONS_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteCollection(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${COLLECTIONS_BASE}/${id}`, {
    method: 'DELETE',
  });
}
