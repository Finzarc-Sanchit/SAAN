import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getReadyApp } from '../bootstrap';
import { errorResponse } from '../shared/utils/response';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<unknown> {
  try {
    const app = await getReadyApp();
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler failed:', error);

    if (!res.headersSent) {
      const body = errorResponse(
        'INTERNAL_SERVER_ERROR',
        error instanceof Error ? error.message : 'Server failed to start',
      );
      res.status(500).json(body);
    }

    return undefined;
  }
}
