import { apiRequest, apiRequestWithMeta } from '@/lib/api/client';
import type { PaginationMeta } from '@/lib/types/api';
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderListParams,
  Order,
  OrderStatus,
  Payment,
} from '@/lib/types/order';

const ORDERS_BASE = '/api/v1/orders';
const ADMIN_ORDERS_BASE = '/api/v1/admin/orders';

export const ordersQueryKeys = {
  all: ['admin', 'orders'] as const,
  list: (params: AdminOrderListParams) => [...ordersQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...ordersQueryKeys.all, 'detail', id] as const,
  payments: (orderId: string) => [...ordersQueryKeys.all, 'payments', orderId] as const,
};

function buildListQuery(params: AdminOrderListParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.paymentStatus) search.set('paymentStatus', params.paymentStatus);
  if (params.search) search.set('search', params.search);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export type AdminOrderListResult = {
  items: AdminOrderListItem[];
  meta: PaginationMeta;
};

export async function listAdminOrders(
  params: AdminOrderListParams = {},
): Promise<AdminOrderListResult> {
  const { data, meta } = await apiRequestWithMeta<AdminOrderListItem[]>(
    `${ADMIN_ORDERS_BASE}${buildListQuery(params)}`,
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

export async function fetchAdminOrder(id: string): Promise<AdminOrderDetail> {
  return apiRequest<AdminOrderDetail>(`${ADMIN_ORDERS_BASE}/${id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return apiRequest<Order>(`${ORDERS_BASE}/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function listOrderPayments(orderId: string): Promise<Payment[]> {
  return apiRequest<Payment[]>(`${ORDERS_BASE}/${orderId}/payments`);
}
