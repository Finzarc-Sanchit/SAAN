import { apiRequest } from '@/lib/api/client';
import type {
  AnalyticsSummary,
  AnalyticsTarget,
  MonthlySalesPoint,
  MonthlyTargetRecord,
  RecentOrderRow,
  StatisticsPeriod,
  StatisticsPoint,
  TopSellingProduct,
} from '@/lib/types/analytics';

const ANALYTICS_BASE = '/api/v1/admin/analytics';

export const analyticsQueryKeys = {
  all: ['admin', 'analytics'] as const,
  summary: () => [...analyticsQueryKeys.all, 'summary'] as const,
  monthlySales: (year?: number) =>
    [...analyticsQueryKeys.all, 'monthly-sales', year ?? 'current'] as const,
  target: () => [...analyticsQueryKeys.all, 'target'] as const,
  statistics: (period: StatisticsPeriod, from: string, to: string) =>
    [...analyticsQueryKeys.all, 'statistics', period, from, to] as const,
  topProducts: (limit = 5) => [...analyticsQueryKeys.all, 'top-products', limit] as const,
  recentOrders: (limit = 5) => [...analyticsQueryKeys.all, 'recent-orders', limit] as const,
};

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>(`${ANALYTICS_BASE}/summary`);
}

export async function fetchMonthlySales(year?: number): Promise<MonthlySalesPoint[]> {
  const query = year ? `?year=${year}` : '';
  return apiRequest<MonthlySalesPoint[]>(`${ANALYTICS_BASE}/monthly-sales${query}`);
}

export async function fetchAnalyticsTarget(): Promise<AnalyticsTarget> {
  return apiRequest<AnalyticsTarget>(`${ANALYTICS_BASE}/target`);
}

export async function fetchAnalyticsStatistics(params: {
  period: StatisticsPeriod;
  from: string;
  to: string;
}): Promise<StatisticsPoint[]> {
  const search = new URLSearchParams({
    period: params.period,
    from: params.from,
    to: params.to,
  });
  return apiRequest<StatisticsPoint[]>(`${ANALYTICS_BASE}/statistics?${search.toString()}`);
}

export async function fetchTopSellingProducts(limit = 5): Promise<TopSellingProduct[]> {
  return apiRequest<TopSellingProduct[]>(`${ANALYTICS_BASE}/top-products?limit=${limit}`);
}

export async function fetchRecentOrders(limit = 5): Promise<RecentOrderRow[]> {
  return apiRequest<RecentOrderRow[]>(`${ANALYTICS_BASE}/recent-orders?limit=${limit}`);
}

export async function listMonthlyTargets(): Promise<MonthlyTargetRecord[]> {
  return apiRequest<MonthlyTargetRecord[]>(`${ANALYTICS_BASE}/targets`);
}

export async function upsertCurrentMonthTarget(
  targetAmount: number,
): Promise<MonthlyTargetRecord> {
  return apiRequest<MonthlyTargetRecord>(`${ANALYTICS_BASE}/targets`, {
    method: 'POST',
    body: { targetAmount },
  });
}
