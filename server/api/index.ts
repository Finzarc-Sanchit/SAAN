import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getReadyApp } from '../bootstrap';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<unknown> {
  const app = await getReadyApp();
  return app(req, res);
}
