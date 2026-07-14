import { apiRequest } from '@/lib/api/client';
import type { CreateSizeInput, GarmentSize, UpdateSizeInput } from '@/lib/types/size';

const SIZES_BASE = '/api/v1/sizes';

export const sizesQueryKeys = {
  all: ['admin', 'sizes'] as const,
  list: () => [...sizesQueryKeys.all] as const,
};

export async function listSizes(): Promise<GarmentSize[]> {
  return apiRequest<GarmentSize[]>(SIZES_BASE);
}

export async function createSize(input: CreateSizeInput): Promise<GarmentSize> {
  return apiRequest<GarmentSize>(SIZES_BASE, {
    method: 'POST',
    body: input,
  });
}

export async function updateSize(id: string, input: UpdateSizeInput): Promise<GarmentSize> {
  return apiRequest<GarmentSize>(`${SIZES_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteSize(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${SIZES_BASE}/${id}`, {
    method: 'DELETE',
  });
}
