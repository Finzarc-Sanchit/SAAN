import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
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
import { CollectionModel } from '../../infrastructure/database/mongodb/models/collection.model';
import { ProductModel } from '../../infrastructure/database/mongodb/models/product.model';
import { SizeModel } from '../../infrastructure/database/mongodb/models/size.model';
import { WishlistModel } from '../../infrastructure/database/mongodb/models/wishlist.model';
import { resetConnectionsForTests } from '../../middlewares/ensure-connections.middleware';
import { seedTestCollection } from '../helpers/catalog-collection';

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

describe('Wishlist flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let categoryId: string;
  let collectionId: string;
  let productId: string;
  let sizeId: string;
  let customerUserId: string;

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
    customerUserId = new Types.ObjectId().toString();

    await WishlistModel.deleteMany({});
    await CartModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CollectionModel.deleteMany({});
    await SizeModel.deleteMany({});
    await WishlistModel.syncIndexes();
    await CartModel.syncIndexes();
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

    const mSize = await request(app)
      .post('/api/v1/sizes')
      .set('Authorization', adminAuthHeader())
      .send({ label: 'M', sortOrder: 1 })
      .expect(201);

    const productResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', adminAuthHeader())
      .send({
        categoryId,
        collectionId,
        name: 'Linen Shirt',
        description: 'A relaxed linen shirt.',
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
        basePrice: 5000,
        status: 'active',
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        sizes: [{ sizeId: mSize.body.data.sizeId as string, quantity: 10 }],
        images: [{ imageUrl: 'https://example.com/shirt.jpg', sortOrder: 0 }],
      })
      .expect(201);

    productId = productResponse.body.data.id as string;
    sizeId = productResponse.body.data.sizes[0].sizeId as string;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a product twice and keeps only one wishlist entry', async () => {
    const firstResponse = await request(app)
      .post('/api/v1/wishlist/items')
      .set('Authorization', customerAuthHeader(customerUserId))
      .send({ productId })
      .expect(201);

    expect(firstResponse.body.data.items).toHaveLength(1);

    const secondResponse = await request(app)
      .post('/api/v1/wishlist/items')
      .set('Authorization', customerAuthHeader(customerUserId))
      .send({ productId })
      .expect(201);

    expect(secondResponse.body.data.items).toHaveLength(1);
    expect(secondResponse.body.data.items[0].productId).toBe(productId);

    const wishlistDoc = await WishlistModel.findOne({
      userId: new Types.ObjectId(customerUserId),
    })
      .lean()
      .exec();

    expect(wishlistDoc?.items).toHaveLength(1);
    expect(wishlistDoc?.items[0]?.productId.toString()).toBe(productId);
  });

  it('moves a wishlist item to cart and removes it from the wishlist', async () => {
    const addResponse = await request(app)
      .post('/api/v1/wishlist/items')
      .set('Authorization', customerAuthHeader(customerUserId))
      .send({ productId })
      .expect(201);

    const wishlistItemId = addResponse.body.data.items[0].wishlistItemId as string;

    const moveResponse = await request(app)
      .post(`/api/v1/wishlist/items/${wishlistItemId}/move-to-cart`)
      .set('Authorization', customerAuthHeader(customerUserId))
      .send({ sizeId, quantity: 2 })
      .expect(200);

    expect(moveResponse.body.data.items).toHaveLength(0);

    const wishlistDoc = await WishlistModel.findOne({
      userId: new Types.ObjectId(customerUserId),
    })
      .lean()
      .exec();

    expect(wishlistDoc?.items).toHaveLength(0);

    const cartDoc = await CartModel.findOne({
      userId: new Types.ObjectId(customerUserId),
    })
      .lean()
      .exec();

    expect(cartDoc?.items).toHaveLength(1);
    expect(cartDoc?.items[0]?.productId.toString()).toBe(productId);
    expect(cartDoc?.items[0]?.sizeId).toBe(sizeId);
    expect(cartDoc?.items[0]?.quantity).toBe(2);
  });
});
