import { Router } from 'express';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { USER_ROLES } from '../../shared/constants';
import type { AnalyticsController } from './analytics.controller';
import {
  monthlySalesQueryDto,
  recentOrdersQueryDto,
  statisticsQueryDto,
  topProductsQueryDto,
  upsertCurrentMonthTargetDto,
} from './analytics.dto';

export function createAnalyticsRoutes(analyticsController: AnalyticsController): Router {
  const router = Router();
  const adminOnly = [authMiddleware, requireRole(USER_ROLES.ADMIN)] as const;

  router.get('/summary', ...adminOnly, analyticsController.getSummary);
  router.get(
    '/monthly-sales',
    ...adminOnly,
    validate(monthlySalesQueryDto, 'query'),
    analyticsController.getMonthlySales,
  );
  router.get('/target', ...adminOnly, analyticsController.getTarget);
  router.get(
    '/statistics',
    ...adminOnly,
    validate(statisticsQueryDto, 'query'),
    analyticsController.getStatistics,
  );
  router.get(
    '/top-products',
    ...adminOnly,
    validate(topProductsQueryDto, 'query'),
    analyticsController.getTopProducts,
  );
  router.get(
    '/recent-orders',
    ...adminOnly,
    validate(recentOrdersQueryDto, 'query'),
    analyticsController.getRecentOrders,
  );
  router.get('/targets', ...adminOnly, analyticsController.listTargets);
  router.post(
    '/targets',
    ...adminOnly,
    validate(upsertCurrentMonthTargetDto),
    analyticsController.upsertCurrentMonthTarget,
  );

  return router;
}
