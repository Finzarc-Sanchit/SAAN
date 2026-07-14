import { USER_ROLES } from '../../shared/constants';
import { ValidationError } from '../../shared/errors/validation-error';
import type { ICategoryRepository } from '../category/category.repository.interface';
import type { IOrderRepository } from '../order/order.repository.interface';
import type { IProductRepository } from '../product/product.repository.interface';
import type { IUserRepository } from '../user/user.repository.interface';
import type { IMonthlyTargetRepository } from './target.repository.interface';
import type {
  AnalyticsSummary,
  AnalyticsTargetView,
  MonthlySalesPoint,
  RecentOrderRow,
  StatisticsPeriod,
  StatisticsPoint,
  TopSellingProduct,
  TrendDirection,
} from './analytics.types';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Hard cap on statistics date range to avoid unbounded aggregations. */
export const MAX_STATISTICS_RANGE_MS = 2 * 365 * 24 * 60 * 60 * 1000;

/**
 * Growth vs previous period.
 * When previous === 0, returns 0 (avoids divide-by-zero; does not invent infinite %).
 */
export function computeGrowthPercent(current: number, previous: number): number {
  if (previous === 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
}

export function computePercentAchieved(revenueAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) {
    return 0;
  }
  return (revenueAmount / targetAmount) * 100;
}

export function resolveTrend(current: number, previous: number): TrendDirection {
  return current >= previous ? 'up' : 'down';
}

export function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addUtcMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days),
  );
}

export function fillMonthlySales(
  buckets: Array<{ month: number; total: number }>,
): MonthlySalesPoint[] {
  const byMonth = new Map(buckets.map((bucket) => [bucket.month, bucket.total]));

  return MONTH_LABELS.map((label, index) => ({
    month: label,
    total: byMonth.get(index + 1) ?? 0,
  }));
}

function formatSeriesDate(date: Date, period: StatisticsPeriod): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;

  if (period === 'annually') {
    return String(year);
  }

  if (period === 'quarterly') {
    const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
    return `Q${quarter} ${year}`;
  }

  return `${MONTH_LABELS[month - 1]} ${year}`;
}

export class AnalyticsService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly targetRepository: IMonthlyTargetRepository,
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async getSummary(now = new Date()): Promise<AnalyticsSummary> {
    const currentFrom = startOfUtcMonth(now);
    const currentTo = addUtcMonths(currentFrom, 1);
    const previousFrom = addUtcMonths(currentFrom, -1);
    const previousTo = currentFrom;

    const [
      customersCurrent,
      customersPrevious,
      ordersCurrent,
      ordersPrevious,
    ] = await Promise.all([
      this.userRepository.countUsersBetween(currentFrom, currentTo, USER_ROLES.CUSTOMER),
      this.userRepository.countUsersBetween(previousFrom, previousTo, USER_ROLES.CUSTOMER),
      this.orderRepository.countOrdersBetween(currentFrom, currentTo),
      this.orderRepository.countOrdersBetween(previousFrom, previousTo),
    ]);

    return {
      customers: {
        count: customersCurrent,
        growthPercent: computeGrowthPercent(customersCurrent, customersPrevious),
      },
      orders: {
        count: ordersCurrent,
        growthPercent: computeGrowthPercent(ordersCurrent, ordersPrevious),
      },
    };
  }

  async getMonthlySales(year?: number, now = new Date()): Promise<MonthlySalesPoint[]> {
    const resolvedYear = year ?? now.getUTCFullYear();
    const buckets = await this.orderRepository.getMonthlySales(resolvedYear);
    return fillMonthlySales(buckets);
  }

  async getTarget(now = new Date()): Promise<AnalyticsTargetView> {
    const month = now.getUTCMonth() + 1;
    const year = now.getUTCFullYear();

    const currentFrom = startOfUtcMonth(now);
    const currentTo = addUtcMonths(currentFrom, 1);
    const previousFrom = addUtcMonths(currentFrom, -1);
    const previousTo = currentFrom;

    const todayFrom = startOfUtcDay(now);
    const todayTo = addUtcDays(todayFrom, 1);
    const yesterdayFrom = addUtcDays(todayFrom, -1);

    const [target, previousTarget, revenueAmount, previousRevenue, todayAmount, yesterdayAmount] =
      await Promise.all([
        this.targetRepository.findByMonthYear(month, year),
        this.targetRepository.findByMonthYear(
          previousFrom.getUTCMonth() + 1,
          previousFrom.getUTCFullYear(),
        ),
        this.orderRepository.getRevenueBetween(currentFrom, currentTo),
        this.orderRepository.getRevenueBetween(previousFrom, previousTo),
        this.orderRepository.getRevenueBetween(todayFrom, todayTo),
        this.orderRepository.getRevenueBetween(yesterdayFrom, todayFrom),
      ]);

    const targetAmount = target?.targetAmount ?? 0;
    const previousTargetAmount = previousTarget?.targetAmount ?? 0;

    return {
      targetAmount,
      revenueAmount,
      todayAmount,
      targetTrend: resolveTrend(targetAmount, previousTargetAmount),
      revenueTrend: resolveTrend(revenueAmount, previousRevenue),
      todayTrend: resolveTrend(todayAmount, yesterdayAmount),
      percentAchieved: computePercentAchieved(revenueAmount, targetAmount),
    };
  }

  async getStatistics(
    period: StatisticsPeriod,
    from: Date,
    to: Date,
  ): Promise<StatisticsPoint[]> {
    const rangeMs = to.getTime() - from.getTime();
    if (rangeMs > MAX_STATISTICS_RANGE_MS) {
      throw new ValidationError('Statistics date range cannot exceed 2 years', [
        { field: 'to', message: 'Date range must be at most 2 years' },
      ]);
    }

    const [orderSeries, revenueSeries] = await Promise.all([
      this.orderRepository.getTimeSeries(period, from, to, 'orders'),
      this.orderRepository.getTimeSeries(period, from, to, 'revenue'),
    ]);

    const revenueByKey = new Map(
      revenueSeries.map((point) => [point.date.toISOString(), point.total]),
    );
    const ordersByKey = new Map(
      orderSeries.map((point) => [point.date.toISOString(), point.total]),
    );

    const allKeys = new Set([...revenueByKey.keys(), ...ordersByKey.keys()]);
    const sortedKeys = [...allKeys].sort();

    return sortedKeys.map((key) => {
      const date = new Date(key);
      return {
        date: formatSeriesDate(date, period),
        orders: ordersByKey.get(key) ?? 0,
        revenue: revenueByKey.get(key) ?? 0,
      };
    });
  }

  async listTargets() {
    return this.targetRepository.findMany();
  }

  async upsertCurrentMonthTarget(targetAmount: number, now = new Date()) {
    return this.targetRepository.upsert({
      month: now.getUTCMonth() + 1,
      year: now.getUTCFullYear(),
      targetAmount,
    });
  }

  async getTopSellingProducts(limit = 5): Promise<TopSellingProduct[]> {
    const { items, totalUnitsSold } = await this.orderRepository.getTopSellingProducts(limit);
    if (items.length === 0) {
      return [];
    }

    const products = await this.productRepository.findByIds(items.map((item) => item.productId));
    const productById = new Map(products.map((product) => [product.id, product]));

    return items.map((item) => {
      const product = productById.get(item.productId);
      const imageUrl =
        product?.images
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)[0]?.imageUrl ?? null;

      return {
        productId: item.productId,
        name: product?.name ?? item.productName,
        imageUrl,
        unitsSold: item.unitsSold,
        percentOfTotal:
          totalUnitsSold > 0
            ? Math.round((item.unitsSold / totalUnitsSold) * 1000) / 10
            : 0,
      };
    });
  }

  async getRecentOrders(limit = 5): Promise<RecentOrderRow[]> {
    const orders = await this.orderRepository.findRecent(limit);
    if (orders.length === 0) {
      return [];
    }

    const productIds = [
      ...new Set(
        orders.flatMap((order) => order.items.map((item) => item.productId)),
      ),
    ];
    const products = await this.productRepository.findByIds(productIds);
    const productById = new Map(products.map((product) => [product.id, product]));

    const categoryIds = [
      ...new Set(
        products
          .map((product) => product.categoryId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const categories = await this.categoryRepository.findMany();
    const categoryById = new Map(
      categories
        .filter((category) => categoryIds.includes(category.id))
        .map((category) => [category.id, category.name]),
    );

    return orders.map((order) => {
      const primaryItem = order.items[0];
      const product = primaryItem ? productById.get(primaryItem.productId) : undefined;
      const imageUrl =
        product?.images
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)[0]?.imageUrl ?? null;

      return {
        orderId: order.id,
        productName: primaryItem?.productNameSnapshot ?? product?.name ?? 'Order',
        productImageUrl: imageUrl,
        variantCount: order.items.length,
        categoryName: product ? (categoryById.get(product.categoryId) ?? null) : null,
        price: order.total,
        currency: order.currency,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      };
    });
  }
}
