import { apiRequest } from '@/lib/api/client';
import type { Address, CreateAddressInput } from '@/lib/types/address';

const ADDRESSES_BASE = '/api/v1/users/me/addresses';

export const addressQueryKeys = {
  all: ['addresses'] as const,
  list: () => [...addressQueryKeys.all, 'list'] as const,
};

export async function listAddresses(): Promise<Address[]> {
  return apiRequest<Address[]>(ADDRESSES_BASE);
}

export async function createAddress(input: CreateAddressInput): Promise<Address> {
  return apiRequest<Address>(ADDRESSES_BASE, {
    method: 'POST',
    body: input,
  });
}
