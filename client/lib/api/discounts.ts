import { formatInr } from '@/lib/admin/format';
import { apiRequest } from '@/lib/api/client';
import type {
  CreateDiscountInput,
  Discount,
  UpdateDiscountInput,
} from '@/lib/types/discount';

const DISCOUNTS_BASE = '/api/v1/discounts';

export const discountsQueryKeys = {
  all: ['admin', 'discounts'] as const,
  list: () => [...discountsQueryKeys.all] as const,
};

export async function listDiscounts(): Promise<Discount[]> {
  return apiRequest<Discount[]>(DISCOUNTS_BASE);
}

export async function createDiscount(input: CreateDiscountInput): Promise<Discount> {
  return apiRequest<Discount>(DISCOUNTS_BASE, {
    method: 'POST',
    body: input,
  });
}

export async function updateDiscount(
  id: string,
  input: UpdateDiscountInput,
): Promise<Discount> {
  return apiRequest<Discount>(`${DISCOUNTS_BASE}/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export async function deleteDiscount(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${DISCOUNTS_BASE}/${id}`, {
    method: 'DELETE',
  });
}

export function formatDiscountValue(discount: Pick<Discount, 'type' | 'value'>): string {
  if (discount.type === 'percentage') {
    return `${discount.value}%`;
  }
  return formatInr(discount.value);
}

export function formatDiscountLabel(discount: Discount): string {
  const amount = formatDiscountValue(discount);
  const from = new Date(discount.validFrom).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const to = new Date(discount.validTo).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return `${discount.type === 'percentage' ? 'Percentage' : 'Flat'} · ${amount} · ${from} – ${to}`;
}
