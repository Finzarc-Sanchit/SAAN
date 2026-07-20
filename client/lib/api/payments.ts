import { apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type { AdminPaymentListItem, AdminPaymentListParams } from '@/lib/types/payment';

const ADMIN_PAYMENTS_BASE = '/api/v1/admin/payments';

export const paymentsQueryKeys = {
  all: ['admin', 'payments'] as const,
  list: (params: AdminPaymentListParams) => [...paymentsQueryKeys.all, 'list', params] as const,
};

function buildListQuery(params: AdminPaymentListParams): string {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.status) search.set('status', params.status);
  if (params.paymentMethod) search.set('paymentMethod', params.paymentMethod);
  if (params.paymentGateway) search.set('paymentGateway', params.paymentGateway);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : '';
}

export type AdminPaymentListResult = {
  items: AdminPaymentListItem[];
  meta: PaginationMeta;
};

export async function listAdminPayments(
  params: AdminPaymentListParams = {},
): Promise<AdminPaymentListResult> {
  const { data, meta } = await apiRequestWithMeta<AdminPaymentListItem[]>(
    `${ADMIN_PAYMENTS_BASE}${buildListQuery(params)}`,
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
