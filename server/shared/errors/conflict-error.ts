import { AppError } from './app-error';

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details: unknown[] = []) {
    super(message, 409, 'CONFLICT', details);
  }
}
