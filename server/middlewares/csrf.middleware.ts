import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { CSRF_HEADER } from '../shared/constants/auth-cookies';
import { ForbiddenError } from '../shared/errors/forbidden-error';

function readCsrfCookieValues(req: Request): string[] {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) {
    return [];
  }

  const prefix = `${env.CSRF_TOKEN_COOKIE_NAME}=`;
  const values: string[] = [];

  for (const part of rawCookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length);
      if (value) {
        values.push(value);
      }
    }
  }

  return values;
}

export function verifyCsrfToken(req: Request, _res: Response, next: NextFunction): void {
  if (env.NODE_ENV === 'test') {
    next();
    return;
  }

  const headerToken = req.get(CSRF_HEADER);

  if (!headerToken) {
    next(new ForbiddenError('Invalid CSRF token'));
    return;
  }

  const cookieValues = readCsrfCookieValues(req);
  const parsedCookie = req.cookies[env.CSRF_TOKEN_COOKIE_NAME] as string | undefined;

  if (parsedCookie && !cookieValues.includes(parsedCookie)) {
    cookieValues.push(parsedCookie);
  }

  if (!cookieValues.some((value) => value === headerToken)) {
    next(new ForbiddenError('Invalid CSRF token'));
    return;
  }

  next();
}
