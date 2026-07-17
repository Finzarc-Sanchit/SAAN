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
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { formatInr } from '@/lib/admin/format';
import { formatOrderDateTime, orderListDateRangeQuery } from '@/lib/admin/order-format';
import { customersQueryKeys, listAdminCustomers } from '@/lib/api/customers';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import type { AdminCustomerListItem } from '@/lib/types/customer';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';

const PAGE_LIMIT = 20;

function VerifiedBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        isVerified
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-saan-champagne/40 text-saan-ink/70 dark:bg-white/10 dark:text-paper/70',
      )}
    >
      {isVerified ? 'Verified' : 'Unverified'}
    </span>
  );
}

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const listParams = useMemo(() => {
    const dateRange = orderListDateRangeQuery(fromDate, toDate);
    return {
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      isVerified:
        verifiedFilter === 'all' ? undefined : verifiedFilter === 'true',
      ...dateRange,
    };
  }, [page, debouncedSearch, verifiedFilter, fromDate, toDate]);

  const listQuery = useQuery({
    queryKey: customersQueryKeys.list(listParams),
    queryFn: () => listAdminCustomers(listParams),
  });

  const columns = useMemo<AdminTableColumn<AdminCustomerListItem>[]>(
    () => [
      {
        id: 'customer',
        header: 'Customer',
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {row.firstName} {row.lastName}
            </p>
            <p className="truncate text-xs text-saan-ink/50 dark:text-paper/50">
              {row.email}
            </p>
          </div>
        ),
      },
      {
        id: 'verified',
        header: 'Verification',
        cell: (row) => <VerifiedBadge isVerified={row.isVerified} />,
      },
      {
        id: 'orders',
        header: 'Orders',
        cell: (row) => <span className="tabular-nums">{row.orderCount}</span>,
      },
      {
        id: 'spent',
        header: 'Total spent',
        cell: (row) => (
          <span className="tabular-nums font-medium">{formatInr(row.totalSpent)}</span>
        ),
      },
      {
        id: 'joined',
        header: 'Joined',
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
            href={`/admin/customers/${row.id}`}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-body text-sm text-ink transition-colors hover:bg-saan-maroon/5 dark:text-ink dark:hover:bg-ink/10"
            aria-label={`View customer ${row.email}`}
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
          Community
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          Customers
        </h1>
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Search
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Name or email…"
              className={adminInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Verification
            </span>
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value as 'all' | 'true' | 'false');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="all">All customers</option>
              <option value="true">Verified only</option>
              <option value="false">Unverified only</option>
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
                : 'Could not load customers'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No customers match these filters."
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
