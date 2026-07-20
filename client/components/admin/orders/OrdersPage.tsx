'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import {
  OrderPaymentStatusBadge,
  OrderStatusBadge,
} from '@/components/admin/orders/OrderStatusBadge';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import {
  formatOrderDateTime,
  formatShortOrderId,
  orderListDateRangeQuery,
} from '@/lib/admin/order-format';
import { formatInr } from '@/lib/admin/format';
import { listAdminOrders, ordersQueryKeys } from '@/lib/api/orders';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import type { AdminOrderListItem, OrderPaymentStatus, OrderStatus } from '@/lib/types/order';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_LIMIT = 20;

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | ''>('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const listParams = useMemo(() => {
    const dateRange = orderListDateRangeQuery(fromDate, toDate);
    return {
      page,
      limit: PAGE_LIMIT,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      search: debouncedSearch.trim() || undefined,
      ...dateRange,
    };
  }, [page, status, paymentStatus, debouncedSearch, fromDate, toDate]);

  const listQuery = useQuery({
    queryKey: ordersQueryKeys.list(listParams),
    queryFn: () => listAdminOrders(listParams),
  });

  const columns = useMemo<AdminTableColumn<AdminOrderListItem>[]>(
    () => [
      {
        id: 'orderId',
        header: 'Order',
        cell: (row) => (
          <span className="font-mono text-sm font-medium">{formatShortOrderId(row.orderNumber)}</span>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.customerName}</p>
            <p className="truncate text-xs text-saan-ink/50 dark:text-paper/50">
              {row.customerEmail}
            </p>
          </div>
        ),
      },
      {
        id: 'items',
        header: 'Items',
        cell: (row) => <span className="tabular-nums">{row.itemCount}</span>,
      },
      {
        id: 'total',
        header: 'Total',
        cell: (row) => <span className="tabular-nums font-medium">{formatInr(row.total)}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <OrderStatusBadge status={row.status} />,
      },
      {
        id: 'paymentStatus',
        header: 'Payment',
        cell: (row) => <OrderPaymentStatusBadge status={row.paymentStatus} />,
      },
      {
        id: 'createdAt',
        header: 'Placed',
        cell: (row) => (
          <span className="text-sm text-saan-ink/70 dark:text-paper/70">
            {formatOrderDateTime(row.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => (
          <Link
            href={`/admin/orders/${encodeURIComponent(row.orderNumber)}`}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-body text-sm text-ink transition-colors hover:bg-saan-maroon/5 dark:text-ink dark:hover:bg-ink/10"
            aria-label={`View order ${formatShortOrderId(row.orderNumber)}`}
          >
            <Eye className="h-4 w-4" strokeWidth={1.5} />
            View
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
          Fulfillment
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          Orders
        </h1>
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="block space-y-1.5 xl:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Search
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Order ID or customer email…"
              className={adminInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as OrderStatus | '');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Payment
            </span>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value as OrderPaymentStatus | '');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="">All payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              From
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className={adminInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              To
            </span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className={adminInputClassName}
            />
          </label>
        </div>

        <AdminDataTable
          columns={columns}
          data={listQuery.data?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={listQuery.isLoading}
          errorMessage={
            listQuery.isError
              ? listQuery.error instanceof ApiError
                ? getApiErrorMessage(listQuery.error)
                : 'Could not load orders'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No orders match these filters."
        />

        {(listQuery.data?.meta.total ?? 0) > 0 ? (
          <AdminPagination
            page={page}
            limit={PAGE_LIMIT}
            total={listQuery.data?.meta.total ?? 0}
            onPageChange={setPage}
          />
        ) : null}
      </AdminCard>
    </div>
  );
}
