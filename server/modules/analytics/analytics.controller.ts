import type { Request, Response } from 'express';
import { successResponse } from '../../shared/utils/response';
import type { AnalyticsService } from './analytics.service';
import type { RedisAnalyticsCache } from '../../infrastructure/database/redis/analytics-cache';

const SUMMARY_CACHE_KEY = 'analytics:summary';
const MONTHLY_SALES_CACHE_PREFIX = 'analytics:monthly-sales:';
const CACHE_TTL_SECONDS = 60;

export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly cache: RedisAnalyticsCache,
  ) {}

  getSummary = async (_req: Request, res: Response): Promise<void> => {
    const cached = await this.cache.get<unknown>(SUMMARY_CACHE_KEY);
    if (cached) {
      res.status(200).json(successResponse(cached));
      return;
    }

    const summary = await this.analyticsService.getSummary();
    await this.cache.set(SUMMARY_CACHE_KEY, summary, CACHE_TTL_SECONDS);
    res.status(200).json(successResponse(summary));
  };

  getMonthlySales = async (req: Request, res: Response): Promise<void> => {
    const year = (req.query as { year?: number }).year;
    const cacheKey = `${MONTHLY_SALES_CACHE_PREFIX}${year ?? 'current'}`;

    const cached = await this.cache.get<unknown>(cacheKey);
    if (cached) {
      res.status(200).json(successResponse(cached));
      return;
    }

    const sales = await this.analyticsService.getMonthlySales(year);
    await this.cache.set(cacheKey, sales, CACHE_TTL_SECONDS);
    res.status(200).json(successResponse(sales));
  };

  getTarget = async (_req: Request, res: Response): Promise<void> => {
    const target = await this.analyticsService.getTarget();
    res.status(200).json(successResponse(target));
  };

  getStatistics = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as {
      period: 'monthly' | 'quarterly' | 'annually';
      from: Date | string;
      to: Date | string;
    };

    const from = query.from instanceof Date ? query.from : new Date(query.from);
    const to = query.to instanceof Date ? query.to : new Date(query.to);

    const statistics = await this.analyticsService.getStatistics(query.period, from, to);
    res.status(200).json(successResponse(statistics));
  };

  listTargets = async (_req: Request, res: Response): Promise<void> => {
    const targets = await this.analyticsService.listTargets();
    res.status(200).json(successResponse(targets));
  };

  upsertCurrentMonthTarget = async (req: Request, res: Response): Promise<void> => {
    const { targetAmount } = req.body as { targetAmount: number };
    const target = await this.analyticsService.upsertCurrentMonthTarget(targetAmount);
    res.status(200).json(successResponse(target));
  };

  getTopProducts = async (req: Request, res: Response): Promise<void> => {
    const limit = Number((req.query as { limit?: number }).limit ?? 5);
    const products = await this.analyticsService.getTopSellingProducts(limit);
    res.status(200).json(successResponse(products));
  };

  getRecentOrders = async (req: Request, res: Response): Promise<void> => {
    const limit = Number((req.query as { limit?: number }).limit ?? 5);
    const orders = await this.analyticsService.getRecentOrders(limit);
    res.status(200).json(successResponse(orders));
  };
}
