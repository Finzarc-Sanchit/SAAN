import { MongoOrderRepository } from '../../infrastructure/database/mongodb/repositories/order.repository';
import { MongoUserRepository } from '../../infrastructure/database/mongodb/repositories/user.repository';
import { MongoMonthlyTargetRepository } from '../../infrastructure/database/mongodb/repositories/monthly-target.repository';
import { RedisAnalyticsCache } from '../../infrastructure/database/redis/analytics-cache';
import { categoryRepository } from '../category/category.module';
import { productRepository } from '../product/product.module';
import { AnalyticsController } from './analytics.controller';
import { createAnalyticsRoutes } from './analytics.routes';
import { AnalyticsService } from './analytics.service';

const orderRepository = new MongoOrderRepository();
const userRepository = new MongoUserRepository();
const targetRepository = new MongoMonthlyTargetRepository();
const analyticsCache = new RedisAnalyticsCache();

const analyticsService = new AnalyticsService(
  orderRepository,
  userRepository,
  targetRepository,
  productRepository,
  categoryRepository,
);
const analyticsController = new AnalyticsController(analyticsService, analyticsCache);

export const analyticsRoutes = createAnalyticsRoutes(analyticsController);

export { analyticsService, analyticsController, targetRepository };
