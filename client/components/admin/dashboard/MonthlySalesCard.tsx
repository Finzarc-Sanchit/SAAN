'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { analyticsQueryKeys, fetchMonthlySales } from '@/lib/api/analytics';
import { formatInr } from '@/lib/admin/format';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function MonthlySalesCard() {
  const prefersReducedMotion = useReducedMotion();
  const year = new Date().getUTCFullYear();
  const query = useQuery({
    queryKey: analyticsQueryKeys.monthlySales(year),
    queryFn: () => fetchMonthlySales(year),
  });

  return (
    <AdminCard title="Monthly Sales" className="h-full">
      {query.isLoading ? (
        <AdminSkeleton className="h-64 w-full rounded-xl" />
      ) : query.isError ? (
        <AdminInlineError onRetry={() => void query.refetch()} />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={query.data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,28,26,0.08)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                width={48}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              <Tooltip
                cursor={{ fill: 'rgba(75,0,6,0.04)' }}
                formatter={(value) => [formatInr(Number(value ?? 0)), 'Sales']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid rgba(220,192,190,0.5)',
                  fontFamily: 'var(--font-karla)',
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="total"
                fill="var(--color-saan-maroon)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={!prefersReducedMotion}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminCard>
  );
}
