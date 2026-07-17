'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AdminCard,
  AdminInlineError,
  AdminSkeleton,
} from '@/components/admin/ui/AdminCard';
import { analyticsQueryKeys, fetchAnalyticsStatistics } from '@/lib/api/analytics';
import {
  formatDisplayRange,
  formatInr,
  statisticsRangeForPeriod,
} from '@/lib/admin/format';
import type { StatisticsPeriod } from '@/lib/types/analytics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const PERIODS: { id: StatisticsPeriod; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'annually', label: 'Annually' },
];

export function StatisticsCard() {
  const prefersReducedMotion = useReducedMotion();
  const [period, setPeriod] = useState<StatisticsPeriod>('monthly');
  const range = useMemo(() => statisticsRangeForPeriod(period), [period]);

  const query = useQuery({
    queryKey: analyticsQueryKeys.statistics(period, range.from, range.to),
    queryFn: () =>
      fetchAnalyticsStatistics({
        period,
        from: range.from,
        to: range.to,
      }),
  });

  return (
    <AdminCard
      title="Statistics"
      action={
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <div
            className="flex rounded-lg border border-saan-champagne/50 p-0.5 dark:border-white/10"
            role="tablist"
            aria-label="Statistics period"
          >
            {PERIODS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={period === entry.id}
                onClick={() => setPeriod(entry.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  period === entry.id
                    ? 'bg-saan-maroon text-paper dark:bg-ink dark:text-saan-charcoal'
                    : 'text-saan-ink/60 hover:text-saan-charcoal dark:text-paper/60 dark:hover:text-paper',
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <p className="font-body text-xs text-saan-ink/50 dark:text-paper/50">
            {formatDisplayRange(range.from, range.to)}
          </p>
        </div>
      }
    >
      {query.isLoading ? (
        <AdminSkeleton className="h-72 w-full rounded-xl" />
      ) : query.isError ? (
        <AdminInlineError onRetry={() => void query.refetch()} />
      ) : (query.data?.length ?? 0) === 0 ? (
        <p className="py-16 text-center font-body text-sm text-saan-ink/50 dark:text-paper/50">
          No statistics for this period yet.
        </p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={query.data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-saan-maroon)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-saan-maroon)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ink)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-ink)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,28,26,0.08)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis
                yAxisId="orders"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                width={36}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                width={48}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              <Tooltip
                formatter={(value, name) => {
                  const numeric = Number(value ?? 0);
                  if (name === 'revenue') {
                    return [formatInr(numeric), 'Revenue'];
                  }
                  return [numeric, 'Orders'];
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(220,192,190,0.5)',
                  fontFamily: 'var(--font-karla)',
                  fontSize: 12,
                }}
              />
              <Legend />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="var(--color-saan-maroon)"
                fill="url(#ordersFill)"
                strokeWidth={2}
                isAnimationActive={!prefersReducedMotion}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="var(--color-ink)"
                fill="url(#revenueFill)"
                strokeWidth={2}
                isAnimationActive={!prefersReducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminCard>
  );
}
