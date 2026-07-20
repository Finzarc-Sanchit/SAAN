import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import type { Application } from 'express';
import { randomUUID } from 'crypto';

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
import { CartModel } from '../../infrastructure/database/mongodb/models/cart.model';
import { CategoryModel } from '../../infrastructure/database/mongodb/models/category.model';
import { CollectionModel } from '../../infrastructure/database/mongodb/models/collection.model';
import { OrderModel } from '../../infrastructure/database/mongodb/models/order.model';
import { ProductModel } from '../../infrastructure/database/mongodb/models/product.model';
import { SizeModel } from '../../infrastructure/database/mongodb/models/size.model';
import { UserModel } from '../../infrastructure/database/mongodb/models/user.model';
import { resetConnectionsForTests } from '../../middlewares/ensure-connections.middleware';
import { seedTestCollection } from '../helpers/catalog-collection';
import { seedStandardSizes } from '../helpers/catalog-sizes';

function adminAuthHeader(): string {
  const token = jwt.sign(
    { sub: 'admin-user', email: 'admin@saan.test', role: 'admin' },
    process.env.JWT_ACCESS_SECRET!,
  );
  return `Bearer ${token}`;
}

function userAuthToken(userId: string, email = 'order@example.com'): string {
  return jwt.sign({ sub: userId, email, role: 'customer' }, process.env.JWT_ACCESS_SECRET!);
}

describe('Order flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let categoryId = '';
  let collectionId = '';
  let sizeSId = '';
  let sizeMId = '';
  let userId = '';
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
    await CartModel.deleteMany({});
    await OrderModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CollectionModel.deleteMany({});
    await SizeModel.deleteMany({});
    await UserModel.deleteMany({});
    await CartModel.syncIndexes();
    await OrderModel.syncIndexes();
    await ProductModel.syncIndexes();
    await CategoryModel.syncIndexes();
    await CollectionModel.syncIndexes();

    const categoryResponse = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', adminAuthHeader())
      .send({ name: 'Linen' })
      .expect(201);

    categoryId = categoryResponse.body.data.id as string;
    collectionId = await seedTestCollection(app, adminAuthHeader());

    const sizes = await seedStandardSizes(app, adminAuthHeader());
    sizeSId = sizes.sizeSId;
    sizeMId = sizes.sizeMId;

    const user = await UserModel.create({
      email: 'order@example.com',
      passwordHash: 'hashed-password',
      firstName: 'Order',
      lastName: 'Tester',
      role: 'customer',
      isVerified: true,
    });

    userId = user._id.toString();
    accessToken = userAuthToken(userId);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function createActiveProduct(options?: {
    nameSuffix?: string;
    sizes?: Array<{ sizeId: string; quantity: number }>;
    basePrice?: number;
  }) {
    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', adminAuthHeader())
      .send({
        categoryId,
        collectionId,
        name: options?.nameSuffix ? `Linen Shirt ${options.nameSuffix}` : 'Linen Shirt',
        description: 'A breathable linen shirt',
        shortDescription: 'Linen shirt',
        fabric: 'Linen',
        color: 'Ivory',
        occasion: ['Daily'],
        fitNotes: "Model is 5'6\" wearing S. Fit relaxed.",
        care: [
          'Dry Clean Only',
          'Do not Wash',
          'Do not Wring',
          'Iron at low temperature',
          'Tumble dry on Low Heat',
        ],
        basePrice: options?.basePrice ?? 5000,
        status: 'active',
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        sizes: options?.sizes ?? [
          { sizeId: sizeSId, quantity: 5 },
          { sizeId: sizeMId, quantity: 8 },
        ],
        images: [{ imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
      })
      .expect(201);

    const product = response.body.data;
    const sizeS = product.sizes.find((entry: { size: string }) => entry.size === 'S');

    return {
      productId: product.id as string,
      sizeSId: sizeS.sizeId as string,
      stock: sizeS.quantity as number,
    };
  }

  async function createUserAddress() {
    const response = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: 'Order',
        lastName: 'Tester',
        phone: '+91 98765 43210',
        address: '12 MG Road',
        apartment: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      })
      .expect(201);

    return response.body.data.addressId as string;
  }

  it('places an order from cart, decrements stock, clears cart, and honors idempotency', async () => {
    const { productId, sizeSId } = await createActiveProduct();
    const addressId = await createUserAddress();
    const idempotencyKey = randomUUID();

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, sizeId: sizeSId, quantity: 2 })
      .expect(200);

    const placeOrderResponse = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({ addressId })
      .expect(201);

    const order = placeOrderResponse.body.data;
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toMatchObject({
      productId,
      sizeId: sizeSId,
      productNameSnapshot: 'Linen Shirt',
      quantity: 2,
      unitPrice: 5000,
      totalPrice: 10000,
    });
    expect(order.subtotal).toBe(10000);
    expect(order.discount).toBe(0);
    expect(order.shippingCharge).toBe(0);
    expect(order.total).toBe(10000);
    expect(order.addressSnapshot).toMatchObject({
      firstName: 'Order',
      lastName: 'Tester',
      city: 'Mumbai',
      apartment: 'Apt 4B',
    });

    const productAfterOrder = await ProductModel.findById(productId).lean();
    const sizeAfterOrder = productAfterOrder?.sizes.find((entry) => entry.sizeId === sizeSId);
    expect(sizeAfterOrder?.quantity).toBe(3);

    const cartAfterOrder = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    // Cart clears after successful payment, not on pending order creation.
    expect(cartAfterOrder.body.data.items).toHaveLength(1);
    expect(cartAfterOrder.body.data.items[0]).toMatchObject({
      productId,
      sizeId: sizeSId,
      quantity: 2,
    });

    const retryResponse = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({ addressId })
      .expect(201);

    expect(retryResponse.body.data.id).toBe(order.id);

    const orderCount = await OrderModel.countDocuments({ userId });
    expect(orderCount).toBe(1);
  });

  it('rejects placement without an Idempotency-Key header', async () => {
    const addressId = await createUserAddress();

    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ addressId })
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('allows only one buyer to claim the last unit when two users checkout concurrently', async () => {
    const { productId } = await createActiveProduct({
      nameSuffix: 'last-unit',
      sizes: [{ sizeId: sizeSId, quantity: 1 }],
    });

    const secondUser = await UserModel.create({
      email: 'second@example.com',
      passwordHash: 'hashed-password',
      firstName: 'Second',
      lastName: 'Buyer',
      role: 'customer',
      isVerified: true,
    });
    const secondUserId = secondUser._id.toString();
    const secondAccessToken = userAuthToken(secondUserId, 'second@example.com');

    const firstAddressId = await createUserAddress();
    const secondAddressResponse = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        firstName: 'Second',
        lastName: 'Buyer',
        phone: '+91 90000 11111',
        address: '22 Park Lane',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
      })
      .expect(201);
    const secondAddressId = secondAddressResponse.body.data.addressId as string;

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, sizeId: sizeSId, quantity: 1 })
      .expect(200);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({ productId, sizeId: sizeSId, quantity: 1 })
      .expect(200);

    const [firstPlacement, secondPlacement] = await Promise.all([
      request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', randomUUID())
        .send({ addressId: firstAddressId }),
      request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .set('Idempotency-Key', randomUUID())
        .send({ addressId: secondAddressId }),
    ]);

    const statuses = [firstPlacement.status, secondPlacement.status].sort();
    expect(statuses).toEqual([201, 400]);

    const failedResponse = firstPlacement.status === 400 ? firstPlacement : secondPlacement;
    expect(failedResponse.body.error.code).toBe('INSUFFICIENT_STOCK');

    const productAfterRace = await ProductModel.findById(productId).lean();
    const sizeAfterRace = productAfterRace?.sizes.find((entry) => entry.sizeId === sizeSId);
    expect(sizeAfterRace?.quantity).toBe(0);

    const orderCount = await OrderModel.countDocuments({});
    expect(orderCount).toBe(1);
  });
});
