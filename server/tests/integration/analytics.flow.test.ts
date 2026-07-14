import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Application } from 'express';
import { Types } from 'mongoose';

jest.mock('rate-limit-redis', () => {
  const { jest: jestGlobals } = require('@jest/globals');
  return {
    RedisStore: jestGlobals.fn().mockImplementation(() => ({
      init: jestGlobals.fn(),
      increment: jestGlobals.fn().mockResolvedValue({ totalHits: 1, resetTime: new Date() }),
      decrement: jestGlobals.fn(),
      resetKey: jestGlobals.fn(),
    })),
  };
});

jest.mock('../../infrastructure/database/redis/connection', () => {
  const { jest: jestGlobals } = require('@jest/globals');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RedisMock = require('ioredis-mock');
  const client = new RedisMock();

  return {
    getRedisClient: () => client,
    connectRedis: jestGlobals.fn().mockResolvedValue(undefined),
    disconnectRedis: jestGlobals.fn().mockResolvedValue(undefined),
    isRedisConnected: () => true,
  };
});

import { createApp } from '../../http/express-app';
import { connectMongo, disconnectMongo } from '../../infrastructure/database/mongodb/connection';
import { getRedisClient } from '../../infrastructure/database/redis/connection';
import { MonthlyTargetModel } from '../../infrastructure/database/mongodb/models/monthly-target.model';
import { OrderModel } from '../../infrastructure/database/mongodb/models/order.model';
import { UserModel } from '../../infrastructure/database/mongodb/models/user.model';
import { resetConnectionsForTests } from '../../middlewares/ensure-connections.middleware';

function adminAuthHeader(): string {
  const token = jwt.sign(
    { sub: 'admin-user', email: 'admin@saan.test', role: 'admin' },
    process.env.JWT_ACCESS_SECRET!,
  );
  return `Bearer ${token}`;
}

function customerAuthHeader(userId = 'customer-user'): string {
  const token = jwt.sign(
    { sub: userId, email: 'customer@saan.test', role: 'customer' },
    process.env.JWT_ACCESS_SECRET!,
  );
  return `Bearer ${token}`;
}

const addressSnapshot = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  phone: '+91 90000 00000',
  address: '1 Atelier Lane',
  apartment: null,
  city: 'Mumbai',
  state: 'MH',
  postalCode: '400001',
};

async function seedPaidOrder(options: {
  userId: Types.ObjectId;
  total: number;
  createdAt: Date;
}) {
  await OrderModel.create({
    userId: options.userId,
    addressSnapshot,
    items: [
      {
        productId: new Types.ObjectId(),
        sizeId: 'size-1',
        productNameSnapshot: 'Linen Shirt',
        quantity: 1,
        unitPrice: options.total,
        totalPrice: options.total,
      },
    ],
    subtotal: options.total,
    discount: 0,
    shippingCharge: 0,
    total: options.total,
    currency: 'INR',
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: options.createdAt,
    updatedAt: options.createdAt,
  });
}

describe('Analytics flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    resetConnectionsForTests();
    await connectMongo();
    app = createApp();
    await OrderModel.syncIndexes();
    await UserModel.syncIndexes();
    await MonthlyTargetModel.syncIndexes();
  }, 60_000);

  afterAll(async () => {
    resetConnectionsForTests();
    await disconnectMongo();
    await mongod.stop();
  }, 60_000);

  beforeEach(async () => {
    await OrderModel.deleteMany({});
    await UserModel.deleteMany({});
    await MonthlyTargetModel.deleteMany({});
    await getRedisClient().flushall();
  }, 30_000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns summary and monthly-sales matching seeded orders across two months', async () => {
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 5));
    const previousMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 10));

    const customerA = await UserModel.create({
      email: 'a@example.com',
      passwordHash: 'hashed',
      firstName: 'A',
      lastName: 'Customer',
      role: 'customer',
      isVerified: true,
      createdAt: currentMonthStart,
      updatedAt: currentMonthStart,
    });

    await UserModel.create({
      email: 'b@example.com',
      passwordHash: 'hashed',
      firstName: 'B',
      lastName: 'Customer',
      role: 'customer',
      isVerified: true,
      createdAt: previousMonthStart,
      updatedAt: previousMonthStart,
    });

    await UserModel.create({
      email: 'admin@example.com',
      passwordHash: 'hashed',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      createdAt: currentMonthStart,
      updatedAt: currentMonthStart,
    });

    await seedPaidOrder({
      userId: customerA._id,
      total: 5000,
      createdAt: currentMonthStart,
    });
    await seedPaidOrder({
      userId: customerA._id,
      total: 3000,
      createdAt: previousMonthStart,
    });

    const summaryResponse = await request(app)
      .get('/api/v1/admin/analytics/summary')
      .set('Authorization', adminAuthHeader())
      .expect(200);

    expect(summaryResponse.body.success).toBe(true);
    expect(summaryResponse.body.data.customers.count).toBe(1);
    expect(summaryResponse.body.data.orders.count).toBe(1);
    expect(summaryResponse.body.data.orders.growthPercent).toBe(0);

    const year = now.getUTCFullYear();
    const salesResponse = await request(app)
      .get(`/api/v1/admin/analytics/monthly-sales?year=${year}`)
      .set('Authorization', adminAuthHeader())
      .expect(200);

    expect(salesResponse.body.data).toHaveLength(12);

    const currentLabel = [
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
    ][now.getUTCMonth()];
    const previousDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const previousLabel = [
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
    ][previousDate.getUTCMonth()];

    const currentBucket = salesResponse.body.data.find(
      (entry: { month: string }) => entry.month === currentLabel,
    );
    expect(currentBucket.total).toBe(5000);

    if (previousDate.getUTCFullYear() === year) {
      const previousBucket = salesResponse.body.data.find(
        (entry: { month: string }) => entry.month === previousLabel,
      );
      expect(previousBucket.total).toBe(3000);
    }
  });

  it('rejects non-admin authenticated users with 403 on all analytics endpoints', async () => {
    const customerHeader = customerAuthHeader();
    const from = '2026-01-01T00:00:00.000Z';
    const to = '2026-03-01T00:00:00.000Z';

    const endpoints = [
      '/api/v1/admin/analytics/summary',
      '/api/v1/admin/analytics/monthly-sales?year=2026',
      '/api/v1/admin/analytics/target',
      `/api/v1/admin/analytics/statistics?period=monthly&from=${from}&to=${to}`,
    ];

    for (const endpoint of endpoints) {
      const response = await request(app).get(endpoint).set('Authorization', customerHeader);
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    }
  });

  it('returns target zeros gracefully when unset and accepts target upsert', async () => {
    const targetResponse = await request(app)
      .get('/api/v1/admin/analytics/target')
      .set('Authorization', adminAuthHeader())
      .expect(200);

    expect(targetResponse.body.data).toMatchObject({
      targetAmount: 0,
      percentAchieved: 0,
    });

    const upsertResponse = await request(app)
      .post('/api/v1/admin/analytics/targets')
      .set('Authorization', adminAuthHeader())
      .send({ targetAmount: 20000 })
      .expect(200);

    expect(upsertResponse.body.data.targetAmount).toBe(20000);

    const listResponse = await request(app)
      .get('/api/v1/admin/analytics/targets')
      .set('Authorization', adminAuthHeader())
      .expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].targetAmount).toBe(20000);
  });

  it('returns shaped responses for summary, monthly-sales, target, and statistics', async () => {
    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 5));
    const previousMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 10));
    const year = now.getUTCFullYear();

    const customer = await UserModel.create({
      email: 'sample@example.com',
      passwordHash: 'hashed',
      firstName: 'Sample',
      lastName: 'Customer',
      role: 'customer',
      isVerified: true,
      createdAt: currentMonthStart,
      updatedAt: currentMonthStart,
    });

    await UserModel.create({
      email: 'prev@example.com',
      passwordHash: 'hashed',
      firstName: 'Prev',
      lastName: 'Customer',
      role: 'customer',
      isVerified: true,
      createdAt: previousMonthStart,
      updatedAt: previousMonthStart,
    });

    await seedPaidOrder({ userId: customer._id, total: 5000, createdAt: currentMonthStart });
    await seedPaidOrder({ userId: customer._id, total: 1500, createdAt: currentMonthStart });
    await seedPaidOrder({ userId: customer._id, total: 3000, createdAt: previousMonthStart });

    await MonthlyTargetModel.create({
      month: now.getUTCMonth() + 1,
      year,
      targetAmount: 20000,
    });

    const from = `${year}-01-01T00:00:00.000Z`;
    const to = `${year + 1}-01-01T00:00:00.000Z`;
    const auth = adminAuthHeader();

    const summary = await request(app)
      .get('/api/v1/admin/analytics/summary')
      .set('Authorization', auth)
      .expect(200);
    const monthlySales = await request(app)
      .get(`/api/v1/admin/analytics/monthly-sales?year=${year}`)
      .set('Authorization', auth)
      .expect(200);
    const target = await request(app)
      .get('/api/v1/admin/analytics/target')
      .set('Authorization', auth)
      .expect(200);
    const statistics = await request(app)
      .get(`/api/v1/admin/analytics/statistics?period=monthly&from=${from}&to=${to}`)
      .set('Authorization', auth)
      .expect(200);

    expect(summary.body.data.customers.count).toBe(1);
    expect(summary.body.data.orders.count).toBe(2);
    expect(monthlySales.body.data).toHaveLength(12);
    expect(target.body.data.targetAmount).toBe(20000);
    expect(target.body.data.percentAchieved).toBe(32.5);
    expect(Array.isArray(statistics.body.data)).toBe(true);
    expect(statistics.body.data[0]).toEqual(
      expect.objectContaining({
        date: expect.any(String),
        orders: expect.any(Number),
        revenue: expect.any(Number),
      }),
    );
  });
});
