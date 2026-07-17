import { Router } from 'express';
import type { EmailJobController } from './email-job.controller';

export function createEmailJobRoutes(controller: EmailJobController): Router {
  const router = Router();
  router.post('/', controller.process);
  return router;
}
