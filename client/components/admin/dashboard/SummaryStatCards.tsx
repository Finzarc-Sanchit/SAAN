'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, ShoppingBag, Users } from 'lucide-react';
import {
  AdminCard,
  AdminInlineError,
  AdminSkeleton,
} from '@/components/admin/ui/AdminCard';
import { analyticsQueryKeys, fetchAnalyticsSummary } from '@/lib/api/analytics';
import { formatCompactNumber, formatGrowthPercent } from '@/lib/admin/format';
import { cn } from '@/lib/utils';

function GrowthPill({ value }: { value: number }) {
  const isPositive = value >= 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        isPositive
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'bg-red-500/10 text-red-700 dark:text-red-300',
      )}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" aria-hidden />
      ) : (
        <ArrowDownRight className="h-3 w-3" aria-hidden />
      )}
      {formatGrowthPercent(value)}
    </span>
  );
}

function StatCard({
  label,
  icon: Icon,
  iconClassName,
  count,
  growthPercent,
  isLoading,
  isError,
  onRetry,
}: {
  label: string;
  icon: typeof Users;
  iconClassName: string;
  count?: number;
  growthPercent?: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  return (
    <AdminCard className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={cn('rounded-xl p-3', iconClassName)}>
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {!isLoading && !isError && growthPercent !== undefined && (
          <GrowthPill value={growthPercent} />
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-saan-ink/45 dark:text-paper/45">
          {label}
        </p>
        {isLoading ? (
          <AdminSkeleton className="mt-2 h-9 w-24" />
        ) : isError ? (
          <div className="mt-2">
            <AdminInlineError onRetry={onRetry} />
          </div>
        ) : (
          <p className="mt-1 font-display text-3xl text-saan-charcoal dark:text-paper">
            {formatCompactNumber(count ?? 0)}
          </p>
        )}
      </div>
    </AdminCard>
  );
}

export function SummaryStatCards() {
  const query = useQuery({
    queryKey: analyticsQueryKeys.summary(),
    queryFn: fetchAnalyticsSummary,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="Customers"
        icon={Users}
        iconClassName="bg-saan-maroon/10 text-ink dark:bg-ink/15 dark:text-ink"
        count={query.data?.customers.count}
        growthPercent={query.data?.customers.growthPercent}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
      />
      <StatCard
        label="Orders"
        icon={ShoppingBag}
        iconClassName="bg-saan-champagne/60 text-saan-charcoal dark:bg-white/10 dark:text-paper"
        count={query.data?.orders.count}
        growthPercent={query.data?.orders.growthPercent}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => void query.refetch()}
      />
    </div>
  );
}
