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
import { CategoryModel } from '../../infrastructure/database/mongodb/models/category.model';
import { CollectionModel } from '../../infrastructure/database/mongodb/models/collection.model';
import { ProductModel } from '../../infrastructure/database/mongodb/models/product.model';
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

describe('Product flow integration', () => {
  let app: Application;
  let mongod: MongoMemoryServer;
  let categoryId: string;
  let collectionId: string;
  let sizeSId = '';
  let sizeMId = '';

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
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CollectionModel.deleteMany({});
    await SizeModel.deleteMany({});
    await ProductModel.syncIndexes();
    await CategoryModel.syncIndexes();
    await CollectionModel.syncIndexes();
    await SizeModel.syncIndexes();

    const categoryResponse = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', adminAuthHeader())
      .send({ name: 'Linen' })
      .expect(201);

    categoryId = categoryResponse.body.data.id as string;
    collectionId = await seedTestCollection(app, adminAuthHeader());

    const sizeSResponse = await request(app)
      .post('/api/v1/sizes')
      .set('Authorization', adminAuthHeader())
      .send({ label: 'S', sortOrder: 1 })
      .expect(201);

    const sizeMResponse = await request(app)
      .post('/api/v1/sizes')
      .set('Authorization', adminAuthHeader())
      .send({ label: 'M', sortOrder: 2 })
      .expect(201);

    sizeSId = sizeSResponse.body.data.sizeId as string;
    sizeMId = sizeMResponse.body.data.sizeId as string;
  });

  it('creates a product without a sale price', async () => {
    const createResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', adminAuthHeader())
      .send({
        categoryId,
        collectionId,
        name: 'Cotton Shirt',
        description: 'A soft cotton shirt.',
        shortDescription: 'Cotton shirt',
        fabric: 'Cotton',
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
        basePrice: 4500,
        status: 'active',
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        sizes: [{ sizeId: sizeSId, quantity: 4 }],
        images: [{ imageUrl: 'https://example.com/cotton.jpg', sortOrder: 0 }],
      })
      .expect(201);

    expect(createResponse.body.data.salePrice).toBeNull();

    const slugResponse = await request(app).get('/api/v1/products/cotton-shirt').expect(200);
    expect(slugResponse.body.data.salePrice).toBeNull();
  });

  it('creates with inline sale price, fetches by slug, adjusts size stock, recalculates top-level stock, archives, and hides archived product publicly', async () => {
    const createResponse = await request(app)
      .post('/api/v1/products')
      .set('Authorization', adminAuthHeader())
      .send({
        categoryId,
        collectionId,
        name: 'Linen Coord Set',
        description: 'A relaxed linen coord set for slow afternoons.',
        shortDescription: 'Linen coord set',
        fabric: 'Linen',
        color: 'Ivory',
        occasion: ['Daily'],
        fitNotes: "Model is 5'6\" wearing S. Fit relaxed.",
        care: ['Dry clean only'],
        basePrice: 8900,
        salePrice: 8010,
        discountPercent: 10,
        discountEnabled: true,
        discountStartDate: '2026-01-01T00:00:00.000Z',
        discountEndDate: '2027-01-01T00:00:00.000Z',
        status: 'active',
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        sizes: [
          { sizeId: sizeSId, quantity: 5 },
          { sizeId: sizeMId, quantity: 7 },
        ],
        images: [{ imageUrl: 'https://example.com/linen.jpg', sortOrder: 0 }],
      })
      .expect(201);

    const productId = createResponse.body.data.id as string;
    const sizeId = createResponse.body.data.sizes[0].sizeId as string;

    expect(createResponse.body.data.stock).toBe(12);
    expect(createResponse.body.data.slug).toBe('linen-coord-set');
    expect(createResponse.body.data.salePrice).toBe(8010);
    expect(createResponse.body.data.discountPercent).toBe(10);
    expect(createResponse.body.data.sizes[0].sizeId).toBe(sizeSId);
    expect(createResponse.body.data.sizes[1].sizeId).toBe(sizeMId);

    const slugResponse = await request(app)
      .get('/api/v1/products/linen-coord-set')
      .expect(200);

    expect(slugResponse.body.data.slug).toBe('linen-coord-set');
    expect(slugResponse.body.data.salePrice).toBe(8010);

    const stockBefore = slugResponse.body.data.stock as number;
    const sizeQuantityBefore = slugResponse.body.data.sizes[0].quantity as number;

    const stockResponse = await request(app)
      .patch(`/api/v1/products/${productId}/sizes/${sizeId}/stock`)
      .set('Authorization', adminAuthHeader())
      .send({ quantityDelta: -2 })
      .expect(200);

    expect(stockResponse.body.data.sizes[0].quantity).toBe(sizeQuantityBefore - 2);
    expect(stockResponse.body.data.stock).toBe(stockBefore - 2);

    await request(app)
      .patch(`/api/v1/products/${productId}/sizes/${sizeId}/stock`)
      .set('Authorization', adminAuthHeader())
      .send({ quantityDelta: -10 })
      .expect(400);

    await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', adminAuthHeader())
      .expect(200);

    await request(app).get('/api/v1/products/linen-coord-set').expect(404);
  });
});
