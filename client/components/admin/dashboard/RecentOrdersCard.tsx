'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Filter } from 'lucide-react';
import {
  AdminCard,
  AdminInlineError,
  AdminSkeleton,
} from '@/components/admin/ui/AdminCard';
import { AdminProductCell } from '@/components/admin/ui/AdminProductCell';
import { analyticsQueryKeys, fetchRecentOrders } from '@/lib/api/analytics';
import { formatInr } from '@/lib/admin/format';
import type { RecentOrderRow } from '@/lib/types/analytics';
import { cn } from '@/lib/utils';

function statusBadge(status: RecentOrderRow['status']) {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      };
    case 'cancelled':
      return {
        label: 'Canceled',
        className: 'bg-red-500/10 text-red-700 dark:text-red-300',
      };
    case 'shipped':
      return {
        label: 'Shipped',
        className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        className: 'bg-ink/20 text-saan-charcoal dark:text-ink',
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      };
  }
}

export function RecentOrdersCard() {
  const query = useQuery({
    queryKey: analyticsQueryKeys.recentOrders(5),
    queryFn: () => fetchRecentOrders(5),
  });

  return (
    <AdminCard
      title="Recent Orders"
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-saan-champagne/60 px-3 py-1.5 font-body text-xs text-saan-ink/50 dark:border-white/10 dark:text-paper/50"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Filter
          </button>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-saan-champagne/60 px-3 py-1.5 font-body text-xs text-saan-charcoal hover:bg-paper dark:border-white/10 dark:text-paper dark:hover:bg-white/5"
            aria-disabled
            onClick={(event) => event.preventDefault()}
          >
            See all
          </Link>
        </div>
      }
      className="h-full overflow-hidden"
    >
      {query.isLoading ? (
        <AdminSkeleton className="h-64 w-full rounded-xl" />
      ) : query.isError ? (
        <AdminInlineError onRetry={() => void query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <p className="py-16 text-center font-body text-sm text-saan-ink/50 dark:text-paper/50">
          No orders yet.
        </p>
      ) : (
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-saan-champagne/40 dark:border-white/10">
                {['Products', 'Category', 'Price', 'Status'].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 font-body text-xs font-medium text-saan-ink/45 dark:text-paper/45"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.data?.map((row) => {
                const badge = statusBadge(row.status);

                return (
                  <tr
                    key={row.orderId}
                    className="border-b border-saan-champagne/30 last:border-0 dark:border-white/5"
                  >
                    <td className="px-5 py-3.5">
                      <AdminProductCell
                        imageUrl={row.productImageUrl}
                        name={row.productName}
                        subtitle={`${row.variantCount} ${row.variantCount === 1 ? 'Variant' : 'Variants'}`}
                      />
                    </td>
                    <td className="px-5 py-3.5 font-body text-sm text-saan-ink/70 dark:text-paper/70">
                      {row.categoryName ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 font-body text-sm text-saan-charcoal dark:text-paper">
                      {formatInr(row.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}
