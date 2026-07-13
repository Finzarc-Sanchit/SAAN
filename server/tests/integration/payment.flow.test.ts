import { createHmac } from 'crypto';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Application } from 'express';

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

jest.mock('razorpay', () => {
  const { jest: jestGlobals } = require('@jest/globals');
  return {
    __esModule: true,
    default: jestGlobals.fn().mockImplementation(() => ({
      orders: {
        create: jestGlobals.fn().mockResolvedValue({ id: 'order_DEX6pnlpxyJrHo' }),
      },
    })),
  };
});

import { createApp } from '../../http/express-app';
import { connectMongo, disconnectMongo } from '../../infrastructure/database/mongodb/connection';
import { OrderModel } from '../../infrastructure/database/mongodb/models/order.model';
import { PaymentModel } from '../../infrastructure/database/mongodb/models/payment.model';
import { ProductModel } from '../../infrastructure/database/mongodb/models/product.model';
import { SizeModel } from '../../infrastructure/database/mongodb/models/size.model';
import { UserModel } from '../../infrastructure/database/mongodb/models/user.model';
import { resetConnectionsForTests } from '../../middlewares/ensure-connections.middleware';
import { slugifyName } from '../../shared/utils/slug';

const RAZORPAY_SAMPLE_WEBHOOK_BODY = JSON.stringify({
  entity: 'event',
  account_id: 'acc_HjRrMR3JAXCmIJ',
  event: 'payment.captured',
  contains: ['payment'],
  payload: {
    payment: {
      entity: {
        id: 'pay_DEX6ipHsLiO4XX',
        entity: 'payment',
        amount: 10000,
        currency: 'INR',
        status: 'captured',
        order_id: 'order_DEX6pnlpxyJrHo',
        method: 'card',
        captured: true,
        email: 'gaurav.kumar@example.com',
        contact: '+919999999999',
        created_at: 1567674795,
      },
    },
  },
  created_at: 1567674795,
});

function signRazorpayWebhook(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

function userAuthToken(userId: string, email = 'payment@example.com'): string {
  return jwt.sign({ sub: userId, email, role: 'customer' }, process.env.JWT_ACCESS_SECRET!);
}

describe('Payment flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let userId = '';
  let orderId = '';
  let accessToken = '';

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    resetConnectionsForTests();
    await connectMongo();
    app = createApp();
  });

  afterAll(async () => {
    resetConnectionsForTests();
    await disconnectMongo();
    await mongod.stop();
  });

  beforeEach(async () => {
    await OrderModel.deleteMany({});
    await PaymentModel.deleteMany({});
    await ProductModel.deleteMany({});
    await SizeModel.deleteMany({});
    await UserModel.deleteMany({});
    await OrderModel.syncIndexes();
    await PaymentModel.syncIndexes();

    const user = await UserModel.create({
      email: 'payment@example.com',
      passwordHash: 'hashed-password',
      firstName: 'Payment',
      lastName: 'Tester',
      role: 'customer',
      isVerified: true,
    });

    userId = user._id.toString();
    accessToken = userAuthToken(userId);

    const mSize = await SizeModel.create({
      sizeId: '400000000099',
      label: 'M',
      sortOrder: 0,
    });

    const product = await ProductModel.create({
      categoryId: '507f1f77bcf86cd799439011',
      name: 'Linen Shirt',
      slug: slugifyName(`Linen Shirt ${Date.now()}`),
      description: 'A linen shirt',
      shortDescription: 'Linen shirt',
      fabric: 'Linen',
      basePrice: 10000,
      ratingsAverage: 0,
      ratingsCount: 0,
      stock: 10,
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      sizes: [{ size: 'M', quantity: 10, sizeId: mSize.sizeId }],
      images: [{ imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
    });

    const order = await OrderModel.create({
      userId,
      addressSnapshot: {
        firstName: 'Payment',
        lastName: 'Tester',
        phone: '9999999999',
        address: '1 Test Street',
        apartment: null,
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      },
      items: [
        {
          productId: product._id,
          sizeId: mSize.sizeId,
          productNameSnapshot: 'Linen Shirt',
          quantity: 1,
          unitPrice: 10000,
          totalPrice: 10000,
        },
      ],
      subtotal: 10000,
      discount: 0,
      shippingCharge: 0,
      total: 10000,
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'pending',
    });

    orderId = order._id.toString();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initiates payment, processes webhook, and updates payment and order state', async () => {
    const initiateResponse = await request(app)
      .post(`/api/v1/orders/${orderId}/payments/initiate`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ paymentMethod: 'card' })
      .expect(201);

    expect(initiateResponse.body.success).toBe(true);
    expect(initiateResponse.body.data.gatewayOrderId).toBe('order_DEX6pnlpxyJrHo');

    const payment = await PaymentModel.findOne({ orderId }).lean().exec();
    expect(payment?.status).toBe('created');
    expect(payment?.gatewayOrderId).toBe('order_DEX6pnlpxyJrHo');

    const signature = signRazorpayWebhook(
      RAZORPAY_SAMPLE_WEBHOOK_BODY,
      process.env.RAZORPAY_WEBHOOK_SECRET!,
    );

    await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(RAZORPAY_SAMPLE_WEBHOOK_BODY)
      .expect(200);

    const updatedPayment = await PaymentModel.findOne({ orderId }).lean().exec();
    expect(updatedPayment?.status).toBe('paid');
    expect(updatedPayment?.gatewayPaymentId).toBe('pay_DEX6ipHsLiO4XX');
    expect(updatedPayment?.paidAt).toBeTruthy();

    const updatedOrder = await OrderModel.findById(orderId).lean().exec();
    expect(updatedOrder?.paymentStatus).toBe('paid');
    expect(updatedOrder?.status).toBe('confirmed');
  });

  it('rejects webhook requests with invalid signatures', async () => {
    await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', 'invalid-signature')
      .send(RAZORPAY_SAMPLE_WEBHOOK_BODY)
      .expect(401);

    const payments = await PaymentModel.find({}).lean().exec();
    expect(payments).toHaveLength(0);
  });
});
