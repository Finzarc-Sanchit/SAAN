'use client';

import { useQuery } from '@tanstack/react-query';
import { MoreVertical } from 'lucide-react';
import {
  AdminCard,
  AdminInlineError,
  AdminSkeleton,
} from '@/components/admin/ui/AdminCard';
import { AdminProductCell } from '@/components/admin/ui/AdminProductCell';
import { analyticsQueryKeys, fetchTopSellingProducts } from '@/lib/api/analytics';
import { cn } from '@/lib/utils';

export function MostItemsSaleCard() {
  const query = useQuery({
    queryKey: analyticsQueryKeys.topProducts(5),
    queryFn: () => fetchTopSellingProducts(5),
  });

  return (
    <AdminCard
      title="Most Items Sale"
      action={
        <button
          type="button"
          className="rounded-lg p-1.5 text-saan-ink/40 hover:bg-saan-bone dark:text-saan-bone/40 dark:hover:bg-white/10"
          aria-label="More options"
          disabled
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      }
      className="h-full"
    >
      <p className="-mt-2 mb-5 font-body text-sm text-saan-ink/50 dark:text-saan-bone/50">
        Top products by units sold
      </p>

      {query.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <AdminSkeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : query.isError ? (
        <AdminInlineError onRetry={() => void query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <p className="py-10 text-center font-body text-sm text-saan-ink/50 dark:text-saan-bone/50">
          No paid sales yet.
        </p>
      ) : (
        <ul className="space-y-5">
          {query.data?.map((item) => (
            <li key={item.productId}>
              <div className="flex items-center gap-3">
                <AdminProductCell
                  imageUrl={item.imageUrl}
                  name={item.name}
                  subtitle={`${item.unitsSold.toLocaleString('en-IN')} sold`}
                  className="min-w-0 flex-1"
                />
                <span className="shrink-0 font-body text-sm font-semibold text-saan-charcoal dark:text-saan-bone">
                  {item.percentOfTotal}%
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-saan-champagne/50 dark:bg-white/10"
                role="progressbar"
                aria-valuenow={item.percentOfTotal}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.name} share of sales`}
              >
                <div
                  className={cn(
                    'h-full rounded-full bg-saan-maroon transition-[width] duration-500 dark:bg-saan-gold motion-reduce:transition-none',
                  )}
                  style={{ width: `${Math.min(item.percentOfTotal, 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
