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
import { PaymentStatusBadge } from '@/components/admin/payments/PaymentStatusBadge';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { formatOrderDateTime, formatShortOrderId, orderListDateRangeQuery } from '@/lib/admin/order-format';
import { formatInr } from '@/lib/admin/format';
import { listAdminPayments, paymentsQueryKeys } from '@/lib/api/payments';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import type { AdminPaymentListItem, PaymentStatus } from '@/lib/types/payment';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const PAGE_LIMIT = 20;

export function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('');
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
      paymentMethod: paymentMethod || undefined,
      paymentGateway: paymentGateway || undefined,
      search: debouncedSearch.trim() || undefined,
      ...dateRange,
    };
  }, [page, status, paymentMethod, paymentGateway, debouncedSearch, fromDate, toDate]);

  const listQuery = useQuery({
    queryKey: paymentsQueryKeys.list(listParams),
    queryFn: () => listAdminPayments(listParams),
  });

  const columns = useMemo<AdminTableColumn<AdminPaymentListItem>[]>(
    () => [
      {
        id: 'order',
        header: 'Order',
        cell: (row) =>
          row.orderNumber && row.orderNumber !== '—' ? (
            <Link
              href={`/admin/orders/${encodeURIComponent(row.orderNumber)}`}
              className="font-mono text-sm font-medium hover:underline"
            >
              {formatShortOrderId(row.orderNumber)}
            </Link>
          ) : (
            <span className="font-mono text-sm text-saan-ink/50 dark:text-paper/50">—</span>
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
        id: 'amount',
        header: 'Amount',
        cell: (row) => <span className="tabular-nums font-medium">{formatInr(row.amount)}</span>,
      },
      {
        id: 'method',
        header: 'Method',
        cell: (row) => (
          <span className="capitalize text-sm text-saan-ink/70 dark:text-paper/70">
            {row.paymentMethod}
          </span>
        ),
      },
      {
        id: 'gateway',
        header: 'Gateway',
        cell: (row) => (
          <span className="text-sm text-saan-ink/70 dark:text-paper/70">{row.paymentGateway}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <PaymentStatusBadge status={row.status} />,
      },
      {
        id: 'paidAt',
        header: 'Paid',
        cell: (row) => (
          <span className="text-sm text-saan-ink/70 dark:text-paper/70">
            {row.paidAt ? formatOrderDateTime(row.paidAt) : '—'}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
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
        cell: (row) =>
          row.orderNumber && row.orderNumber !== '—' ? (
            <Link
              href={`/admin/orders/${encodeURIComponent(row.orderNumber)}`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-body text-sm text-ink transition-colors hover:bg-saan-maroon/5 dark:text-ink dark:hover:bg-ink/10"
              aria-label={`View order ${formatShortOrderId(row.orderNumber)}`}
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} />
              View order
            </Link>
          ) : null,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
          Commerce
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          Payments
        </h1>
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
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
              placeholder="Order id, email, pay_…, order_…"
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
                setStatus(e.target.value as PaymentStatus | '');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="">All statuses</option>
              <option value="created">Created</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Method
            </span>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="">All methods</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Netbanking</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Gateway
            </span>
            <select
              value={paymentGateway}
              onChange={(e) => {
                setPaymentGateway(e.target.value);
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="">All gateways</option>
              <option value="razorpay">Razorpay</option>
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
                : 'Could not load payments'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No payments match these filters."
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
