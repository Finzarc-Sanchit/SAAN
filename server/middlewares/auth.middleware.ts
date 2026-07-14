import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../shared/errors/unauthorized-error';
import { ForbiddenError } from '../shared/errors/forbidden-error';
import type { UserRole } from '../shared/constants';

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

function attachUserFromBearer(req: Request): boolean {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return true;
  } catch {
    return false;
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!attachUserFromBearer(req)) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  next();
}

/** Sets `req.user` when a valid Bearer token is present; never rejects. */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  attachUserFromBearer(req);
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
}
