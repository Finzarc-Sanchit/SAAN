export interface MonthlyTarget {
  id: string;
  month: number;
  year: number;
  targetAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertMonthlyTargetInput {
  month: number;
  year: number;
  targetAmount: number;
}

export type TrendDirection = 'up' | 'down';

export interface MetricWithGrowth {
  count: number;
  /** Growth vs previous period. `0` when previous === 0 (avoids divide-by-zero). */
  growthPercent: number;
}

export interface AnalyticsSummary {
  customers: MetricWithGrowth;
  orders: MetricWithGrowth;
}

export interface MonthlySalesPoint {
  month: string;
  total: number;
}

export interface AnalyticsTargetView {
  targetAmount: number;
  revenueAmount: number;
  todayAmount: number;
  targetTrend: TrendDirection;
  revenueTrend: TrendDirection;
  todayTrend: TrendDirection;
  percentAchieved: number;
}

export interface StatisticsPoint {
  date: string;
  orders: number;
  revenue: number;
}

export type StatisticsPeriod = 'monthly' | 'quarterly' | 'annually';

export interface TopSellingProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsSold: number;
  percentOfTotal: number;
}

export interface RecentOrderRow {
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  variantCount: number;
  categoryName: string | null;
  price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}