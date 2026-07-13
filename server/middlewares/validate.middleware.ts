import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../shared/errors/validation-error';

type ValidationTarget = 'body' | 'query' | 'params';

function assignValidatedData(req: Request, target: ValidationTarget, data: unknown): void {
  if (target === 'query') {
    const query = req.query as Record<string, unknown>;
    const parsed = data as Record<string, unknown>;

    for (const key of Object.keys(query)) {
      delete query[key];
    }

    Object.assign(query, parsed);
    return;
  }

  req[target] = data as never;
}

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      next(new ValidationError('Validation failed', details));
      return;
    }

    assignValidatedData(req, target, result.data);
    next();
  };
}
