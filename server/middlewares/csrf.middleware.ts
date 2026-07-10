import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { CSRF_HEADER } from '../shared/constants/auth-cookies';
import { ForbiddenError } from '../shared/errors/forbidden-error';

export function verifyCsrfToken(req: Request, _res: Response, next: NextFunction): void {
  if (env.NODE_ENV === 'test') {
    next();
    return;
  }

  const cookieToken = req.cookies[env.CSRF_TOKEN_COOKIE_NAME] as string | undefined;
  const headerToken = req.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(new ForbiddenError('Invalid CSRF token'));
    return;
  }

  next();
}
