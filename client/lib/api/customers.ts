import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type {
  AdminCustomerDetail,
  AdminCustomerListItem,
  AdminCustomerListParams,
} from '@/lib/types/customer';

const ADMIN_CUSTOMERS_BASE = '/api/v1/admin/customers';

export const customersQueryKeys = {
  all: ['admin', 'customers'] as const,
  list: (params: AdminCustomerListParams) =>
    [...customersQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...customersQueryKeys.all, 'detail', id] as const,
};

function buildListQuery(params: AdminCustomerListParams): string {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.isVerified !== undefined) {
    search.set('isVerified', params.isVerified ? 'true' : 'false');
  }
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export type AdminCustomerListResult = {
  items: AdminCustomerListItem[];
  meta: PaginationMeta;
};

export async function listAdminCustomers(
  params: AdminCustomerListParams = {},
): Promise<AdminCustomerListResult> {
  const { data, meta } = await apiRequestWithMeta<AdminCustomerListItem[]>(
    `${ADMIN_CUSTOMERS_BASE}${buildListQuery(params)}`,
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

export async function fetchAdminCustomer(id: string): Promise<AdminCustomerDetail> {
  return apiRequest<AdminCustomerDetail>(`${ADMIN_CUSTOMERS_BASE}/${id}`);
}
