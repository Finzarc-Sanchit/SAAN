import express, { type Request, type Response } from 'express';
import { orderPaymentRoutes, paymentWebhookRoutes } from '../modules/payment/payment.module';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '../config/env';
import { authRoutes } from '../modules/auth/auth.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { sizeRoutes } from '../modules/size/size.routes';
import { adminProductRoutes, productRoutes } from '../modules/product/product.module';
import { productReviewRoutes, reviewRoutes } from '../modules/review/review.module';
import { cartRoutes } from '../modules/cart/cart.module';
import { orderRoutes, adminOrderRoutes } from '../modules/order/order.module';
import { userRoutes } from '../modules/user/user.routes';
import { adminCustomerRoutes } from '../modules/user/user.module';
import { wishlistRoutes } from '../modules/wishlist/wishlist.module';
import { uploadRoutes } from '../modules/upload/upload.module';
import { campaignRoutes } from '../modules/campaign/campaign.module';
import {
  adminCollectionRoutes,
  collectionRoutes,
} from '../modules/collection/collection.module';
import { analyticsRoutes } from '../modules/analytics/analytics.module';
import { createContactModule } from '../modules/contact/contact.module';
import {
  adminNewsletterRoutes,
  newsletterRoutes,
} from '../modules/newsletter/newsletter.module';
import { emailJobRoutes, emailQueue } from '../infrastructure/email/email.module';
import { errorHandler } from '../middlewares/error-handler';
import { ensureConnectionsMiddleware } from '../middlewares/ensure-connections.middleware';
import { globalRateLimiter } from '../middlewares/rate-limit.middleware';
import { notFoundHandler, requestLogger } from '../middlewares/request-logger';
import { isMongoConnected } from '../infrastructure/database/mongodb/connection';
import { isRedisConnected } from '../infrastructure/database/redis/connection';
import { successResponse } from '../shared/utils/response';

export function createApp(): express.Application {
  const app = express();
  const contactModule = createContactModule(emailQueue);

  app.set('trust proxy', 1);
  app.use(ensureConnectionsMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Server-to-server requests (e.g. Next.js rewrite proxy) carry no Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }

        if (env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(
    '/api/v1/payments',
    express.raw({ type: 'application/json', limit: '256kb' }),
    paymentWebhookRoutes,
  );
  app.use(
    '/api/v1/internal/email-jobs',
    express.text({ type: 'application/json', limit: '256kb' }),
    emailJobRoutes,
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(globalRateLimiter);
  app.use(requestLogger);

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json(successResponse({ status: 'ok' }));
  });

  app.get('/ready', (_req: Request, res: Response) => {
    const mongoReady = isMongoConnected();
    const redisReady = isRedisConnected();

    if (!mongoReady || !redisReady) {
      res.status(503).json(
        successResponse({
          status: 'not_ready',
          mongo: mongoReady,
          redis: redisReady,
        }),
      );
      return;
    }

    res.status(200).json(
      successResponse({
        status: 'ready',
        mongo: true,
        redis: true,
      }),
    );
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/sizes', sizeRoutes);
  app.use('/api/v1/products', productReviewRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/admin/products', adminProductRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/admin/orders', adminOrderRoutes);
  app.use('/api/v1/admin/customers', adminCustomerRoutes);
  app.use('/api/v1/wishlist', wishlistRoutes);
  app.use('/api/v1/uploads', uploadRoutes);
  app.use('/api/v1/campaigns', campaignRoutes);
  app.use('/api/v1/collections', collectionRoutes);
  app.use('/api/v1/admin/collections', adminCollectionRoutes);
  app.use('/api/v1/contact', contactModule.contactRoutes);
  app.use('/api/v1/admin/contacts', contactModule.adminContactRoutes);
  app.use('/api/v1/newsletter', newsletterRoutes);
  app.use('/api/v1/admin/newsletter', adminNewsletterRoutes);
  app.use('/api/v1/admin/analytics', analyticsRoutes);
  app.use('/api/v1/orders', orderPaymentRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
