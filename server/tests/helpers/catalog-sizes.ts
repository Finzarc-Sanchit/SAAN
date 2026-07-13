import request from 'supertest';
import type { Application } from 'express';

export async function seedStandardSizes(
  app: Application,
  authHeader: string,
): Promise<{ sizeSId: string; sizeMId: string }> {
  const sizeSResponse = await request(app)
    .post('/api/v1/sizes')
    .set('Authorization', authHeader)
    .send({ label: 'S', sortOrder: 1 })
    .expect(201);

  const sizeMResponse = await request(app)
    .post('/api/v1/sizes')
    .set('Authorization', authHeader)
    .send({ label: 'M', sortOrder: 2 })
    .expect(201);

  return {
    sizeSId: sizeSResponse.body.data.sizeId as string,
    sizeMId: sizeMResponse.body.data.sizeId as string,
  };
}
