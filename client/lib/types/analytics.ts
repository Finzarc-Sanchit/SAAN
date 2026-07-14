export type AnalyticsTrend = 'up' | 'down';

export type AnalyticsMetricWithGrowth = {
  count: number;
  growthPercent: number;
};

export type AnalyticsSummary = {
  customers: AnalyticsMetricWithGrowth;
  orders: AnalyticsMetricWithGrowth;
};

export type MonthlySalesPoint = {
  month: string;
  total: number;
};

export type AnalyticsTarget = {
  targetAmount: number;
  revenueAmount: number;
  todayAmount: number;
  targetTrend: AnalyticsTrend;
  revenueTrend: AnalyticsTrend;
  todayTrend: AnalyticsTrend;
  percentAchieved: number;
};

export type StatisticsPeriod = 'monthly' | 'quarterly' | 'annually';

export type StatisticsPoint = {
  date: string;
  orders: number;
  revenue: number;
};

export type MonthlyTargetRecord = {
  id: string;
  month: number;
  year: number;
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type TopSellingProduct = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsSold: number;
  percentOfTotal: number;
};

export type RecentOrderRow = {
  orderId: string;
  productName: string;
  productImageUrl: string | null;
  variantCount: number;
  categoryName: string | null;
  price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
};
