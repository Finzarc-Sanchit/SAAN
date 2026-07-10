import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../shared/errors/unauthorized-error';
import { ForbiddenError } from '../shared/errors/forbidden-error';
import type { AuthenticatedUser } from '../modules/auth/auth.types';
import type { UserRole } from '../shared/constants';

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    const user: AuthenticatedUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    req.user = user;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
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
