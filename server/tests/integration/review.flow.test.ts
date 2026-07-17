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
import { CategoryModel } from '../../infrastructure/database/mongodb/models/category.model';
import { CollectionModel } from '../../infrastructure/database/mongodb/models/collection.model';
import { ProductModel } from '../../infrastructure/database/mongodb/models/product.model';
import { ReviewModel } from '../../infrastructure/database/mongodb/models/review.model';
import { SizeModel } from '../../infrastructure/database/mongodb/models/size.model';
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

describe('Review flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let categoryId: string;
  let collectionId: string;
  let productId: string;
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

    await ReviewModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CollectionModel.deleteMany({});
    await SizeModel.deleteMany({});
    await ReviewModel.syncIndexes();
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
  });

  it('creates a review, updates product ratings, deletes review, and recomputes ratings', async () => {
    const createResponse = await request(app)
      .post(`/api/v1/products/${productId}/reviews`)
      .set('Authorization', customerAuthHeader(customerUserId))
      .send({ rating: 4, review: 'Lovely texture and drape.' })
      .expect(201);

    const reviewId = createResponse.body.data.id as string;
    expect(createResponse.body.data.rating).toBe(4);

    let product = await ProductModel.findById(productId).lean().exec();
    expect(product?.ratingsAverage).toBe(4);
    expect(product?.ratingsCount).toBe(1);

    const listResponse = await request(app)
      .get(`/api/v1/products/${productId}/reviews`)
      .expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.meta.total).toBe(1);

    await request(app)
      .delete(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', customerAuthHeader(customerUserId))
      .expect(200);

    product = await ProductModel.findById(productId).lean().exec();
    expect(product?.ratingsAverage).toBe(0);
    expect(product?.ratingsCount).toBe(0);
  });

  it('rejects a duplicate review via API and compound unique index', async () => {
    const duplicateUserId = new Types.ObjectId().toString();

    await request(app)
      .post(`/api/v1/products/${productId}/reviews`)
      .set('Authorization', customerAuthHeader(duplicateUserId))
      .send({ rating: 5, review: 'First review' })
      .expect(201);

    await request(app)
      .post(`/api/v1/products/${productId}/reviews`)
      .set('Authorization', customerAuthHeader(duplicateUserId))
      .send({ rating: 3, review: 'Second attempt' })
      .expect(409);

    await expect(
      ReviewModel.create({
        productId: new Types.ObjectId(productId),
        userId: new Types.ObjectId(duplicateUserId),
        rating: 2,
        review: 'Direct duplicate insert',
      }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('forbids another customer from updating a review', async () => {
    const authorUserId = new Types.ObjectId().toString();
    const otherUserId = new Types.ObjectId().toString();

    const createResponse = await request(app)
      .post(`/api/v1/products/${productId}/reviews`)
      .set('Authorization', customerAuthHeader(authorUserId))
      .send({ rating: 4, review: 'My review' })
      .expect(201);

    const reviewId = createResponse.body.data.id as string;

    await request(app)
      .patch(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', customerAuthHeader(otherUserId))
      .send({ rating: 1 })
      .expect(403);
  });
});
