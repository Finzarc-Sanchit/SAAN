import { AppError } from './app-error';

export class InsufficientStockError extends AppError {
  constructor(message = 'Insufficient stock', details: unknown[] = []) {
    super(message, 400, 'INSUFFICIENT_STOCK', details);
  }
}
