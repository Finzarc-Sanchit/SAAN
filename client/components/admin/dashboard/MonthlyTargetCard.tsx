'use client';

import { useQuery } from '@tanstack/react-query';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import {
  AdminCard,
  AdminInlineError,
  AdminSkeleton,
} from '@/components/admin/ui/AdminCard';
import { analyticsQueryKeys, fetchAnalyticsTarget } from '@/lib/api/analytics';
import { formatInr } from '@/lib/admin/format';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function MonthlyTargetCard() {
  const prefersReducedMotion = useReducedMotion();
  const query = useQuery({
    queryKey: analyticsQueryKeys.target(),
    queryFn: fetchAnalyticsTarget,
  });

  const percent = Math.min(Math.max(query.data?.percentAchieved ?? 0, 0), 100);
  const chartData = [
    { name: 'achieved', value: percent },
    { name: 'remaining', value: Math.max(100 - percent, 0) },
  ];

  return (
    <AdminCard title="Monthly Target" className="h-full">
      {query.isLoading ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <AdminSkeleton className="h-40 w-40 rounded-full" />
          <AdminSkeleton className="h-4 w-48" />
        </div>
      ) : query.isError ? (
        <AdminInlineError onRetry={() => void query.refetch()} />
      ) : (
        <>
          <div className="relative mx-auto h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive={!prefersReducedMotion}
                >
                  <Cell fill="var(--color-saan-maroon)" />
                  <Cell fill="color-mix(in srgb, var(--color-saan-champagne) 55%, transparent)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-3xl text-saan-charcoal dark:text-paper">
                {Math.round(percent)}%
              </p>
              <p className="text-[10px] uppercase tracking-wider text-saan-ink/45 dark:text-paper/45">
                Achieved
              </p>
            </div>
          </div>

          <p className="mt-2 text-center font-body text-sm text-saan-ink/70 dark:text-paper/70">
            You earned {formatInr(query.data?.todayAmount ?? 0)} today ·{' '}
            {formatInr(query.data?.revenueAmount ?? 0)} this month
          </p>

          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-saan-champagne/40 pt-4 dark:border-white/10">
            {(
              [
                ['Target', query.data?.targetAmount ?? 0],
                ['Revenue', query.data?.revenueAmount ?? 0],
                ['Today', query.data?.todayAmount ?? 0],
              ] as const
            ).map(([label, amount]) => (
              <div key={label} className="text-center">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-saan-ink/45 dark:text-paper/45">
                  {label}
                </dt>
                <dd className="mt-1 font-body text-sm font-medium text-saan-charcoal dark:text-paper">
                  {formatInr(amount)}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </AdminCard>
  );
}
