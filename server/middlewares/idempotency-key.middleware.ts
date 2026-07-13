import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../shared/errors/validation-error';

export function requireIdempotencyKey(req: Request, _res: Response, next: NextFunction): void {
  const rawKey = req.header('Idempotency-Key');

  if (!rawKey || rawKey.trim().length === 0) {
    next(
      new ValidationError('Idempotency-Key header is required', [
        { field: 'Idempotency-Key', message: 'Header is required for order placement' },
      ]),
    );
    return;
  }

  if (rawKey.length > 255) {
    next(
      new ValidationError('Idempotency-Key header is invalid', [
        { field: 'Idempotency-Key', message: 'Key must be 255 characters or fewer' },
      ]),
    );
    return;
  }

  req.idempotencyKey = rawKey.trim();
  next();
}
