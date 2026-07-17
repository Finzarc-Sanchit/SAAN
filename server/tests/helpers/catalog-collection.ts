import request from 'supertest';
import type { Application } from 'express';

export async function seedTestCollection(
  app: Application,
  authHeader: string,
  overrides?: { title?: string },
): Promise<string> {
  const response = await request(app)
    .post('/api/v1/admin/collections')
    .set('Authorization', authHeader)
    .send({
      title: overrides?.title ?? 'Summer Edit',
      description: 'A light seasonal edit for integration tests.',
      tagline: 'Made for long days.',
      imageUrl: 'https://example.com/summer-edit.jpg',
      imageAlt: 'Summer Edit',
      status: 'published',
      sortOrder: 0,
      featured: false,
    })
    .expect(201);

  return response.body.data.id as string;
}
