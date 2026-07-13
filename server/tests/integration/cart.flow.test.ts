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

import { createApp } from '../../http/express-app';
import { connectMongo, disconnectMongo } from '../../infrastructure/database/mongodb/connection';
import { CartModel } from '../../infrastructure/database/mongodb/models/cart.model';
import { CategoryModel } from '../../infrastructure/database/mongodb/models/category.model';
import { ProductModel } from '../../infrastructure/database/mongodb/models/product.model';
import { SizeModel } from '../../infrastructure/database/mongodb/models/size.model';
import { UserModel } from '../../infrastructure/database/mongodb/models/user.model';
import { resetConnectionsForTests } from '../../middlewares/ensure-connections.middleware';
import { seedStandardSizes } from '../helpers/catalog-sizes';

function adminAuthHeader(): string {
  const token = jwt.sign(
    { sub: 'admin-user', email: 'admin@saan.test', role: 'admin' },
    process.env.JWT_ACCESS_SECRET!,
  );
  return `Bearer ${token}`;
}

function userAuthToken(userId: string, email = 'cart@example.com'): string {
  return jwt.sign({ sub: userId, email, role: 'customer' }, process.env.JWT_ACCESS_SECRET!);
}

describe('Cart flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let categoryId = '';
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
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await SizeModel.deleteMany({});
    await UserModel.deleteMany({});
    await CartModel.syncIndexes();
    await ProductModel.syncIndexes();
    await CategoryModel.syncIndexes();

    const categoryResponse = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', adminAuthHeader())
      .send({ name: 'Linen' })
      .expect(201);

    categoryId = categoryResponse.body.data.id as string;

    const sizes = await seedStandardSizes(app, adminAuthHeader());
    sizeSId = sizes.sizeSId;
    sizeMId = sizes.sizeMId;

    const user = await UserModel.create({
      email: 'cart@example.com',
      passwordHash: 'hashed-password',
      firstName: 'Cart',
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

  async function createActiveProduct() {
    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', adminAuthHeader())
      .send({
        categoryId,
        name: `Linen Shirt ${Date.now()}`,
        description: 'A breathable linen shirt',
        shortDescription: 'Linen shirt',
        fabric: 'Linen',
        basePrice: 5000,
        status: 'active',
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        sizes: [
          { sizeId: sizeSId, quantity: 5 },
          { sizeId: sizeMId, quantity: 8 },
        ],
        images: [{ imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
      })
      .expect(201);

    const product = response.body.data;
    const sizeS = product.sizes.find((entry: { size: string }) => entry.size === 'S');
    const sizeM = product.sizes.find((entry: { size: string }) => entry.size === 'M');

    return {
      productId: product.id as string,
      sizeSId: sizeS.sizeId as string,
      sizeMId: sizeM.sizeId as string,
    };
  }

  it('adds two sizes as separate lines, increments duplicate size, and clears cart', async () => {
    const { productId, sizeSId, sizeMId } = await createActiveProduct();

    const firstAdd = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, sizeId: sizeSId, quantity: 1 })
      .expect(200);

    const afterFirstAdd = firstAdd.body.data.items as Array<{
      cartItemId: string;
      sizeId: string;
      quantity: number;
    }>;

    expect(afterFirstAdd).toHaveLength(1);
    expect(afterFirstAdd[0]?.sizeId).toBe(sizeSId);
    expect(afterFirstAdd[0]?.quantity).toBe(1);

    const secondAdd = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, sizeId: sizeMId, quantity: 2 })
      .expect(200);

    const afterSecondAdd = secondAdd.body.data.items as Array<{
      cartItemId: string;
      sizeId: string;
      quantity: number;
    }>;

    expect(afterSecondAdd).toHaveLength(2);

    const thirdAdd = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId, sizeId: sizeSId, quantity: 3 })
      .expect(200);

    const afterThirdAdd = thirdAdd.body.data.items as Array<{
      cartItemId: string;
      sizeId: string;
      quantity: number;
    }>;

    expect(afterThirdAdd).toHaveLength(2);

    const sizeLine = afterThirdAdd.find((entry) => entry.sizeId === sizeSId);
    const mediumLine = afterThirdAdd.find((entry) => entry.sizeId === sizeMId);

    expect(sizeLine?.quantity).toBe(4);
    expect(mediumLine?.quantity).toBe(2);

    await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const clearedCart = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(clearedCart.body.data.items).toHaveLength(0);
  });

  it('keeps one line with quantity 2 when two concurrent adds target the same productId+sizeId', async () => {
    const { productId, sizeSId } = await createActiveProduct();

    const [firstResponse, secondResponse] = await Promise.all([
      request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId, sizeId: sizeSId, quantity: 1 }),
      request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId, sizeId: sizeSId, quantity: 1 }),
    ]);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    const finalCart = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const items = finalCart.body.data.items as Array<{
      sizeId: string;
      quantity: number;
    }>;

    expect(items).toHaveLength(1);
    expect(items[0]?.sizeId).toBe(sizeSId);
    expect(items[0]?.quantity).toBe(2);
  });
});
