import type { Paginated, Pagination } from '../../shared/types/pagination';
import type {
  AdminOrderListFilter,
  AdminOrderListItem,
  CreateOrderInput,
  Order,
  OrderPaymentStatus,
  OrderStatus,
} from './order.types';

export type AnalyticsPeriod = 'monthly' | 'quarterly' | 'annually';

export type AnalyticsTimeSeriesMetric = 'revenue' | 'orders';

export interface MonthlySalesBucket {
  month: number;
  total: number;
}

export interface AnalyticsTimeSeriesPoint {
  date: Date;
  total: number;
}

export interface TopProductSaleBucket {
  productId: string;
  productName: string;
  unitsSold: number;
}

export interface TopProductSalesResult {
  items: TopProductSaleBucket[];
  /** Total units across all paid order line items (for percent-of-total). */
  totalUnitsSold: number;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUser(userId: string, pagination: Pagination): Promise<Paginated<Order>>;
  create(data: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  updatePaymentStatus(id: string, paymentStatus: OrderPaymentStatus): Promise<Order>;

  /** Paid-order revenue totals grouped by calendar month (1–12) for the given year. */
  getMonthlySales(year: number): Promise<MonthlySalesBucket[]>;

  /** Sum of paid order totals in [from, to). */
  getRevenueBetween(from: Date, to: Date): Promise<number>;

  /** Count of orders created in [from, to) regardless of payment status. */
  countOrdersBetween(from: Date, to: Date): Promise<number>;

  /**
   * Bucketed series for charts. `metric: 'revenue'` sums paid order totals;
   * `metric: 'orders'` counts all orders in each bucket.
   */
  getTimeSeries(
    period: AnalyticsPeriod,
    from: Date,
    to: Date,
    metric?: AnalyticsTimeSeriesMetric,
  ): Promise<AnalyticsTimeSeriesPoint[]>;

  /** Top products by units sold on paid orders, plus grand-total units sold. */
  getTopSellingProducts(limit: number): Promise<TopProductSalesResult>;

  /** Most recently created orders (any status), newest first. */
  findRecent(limit: number): Promise<Order[]>;

  /** Admin catalog listing with customer enrichment and filters. */
  findManyAdmin(
    filter: AdminOrderListFilter,
    pagination: Pagination,
  ): Promise<Paginated<AdminOrderListItem>>;
}
