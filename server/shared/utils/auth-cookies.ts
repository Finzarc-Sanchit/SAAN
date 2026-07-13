import type { CookieOptions, Response } from 'express';
import { randomBytes } from 'crypto';
import { env } from '../../config/env';
import {
  CSRF_COOKIE_PATH,
  LEGACY_AUTH_COOKIE_PATH,
  REFRESH_COOKIE_PATH,
} from '../constants/auth-cookies';

export function getRefreshCookieOptions(path: string = REFRESH_COOKIE_PATH): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function getCsrfCookieOptions(path: string = CSRF_COOKIE_PATH): CookieOptions {
  return {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions(LEGACY_AUTH_COOKIE_PATH));
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions());
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions(LEGACY_AUTH_COOKIE_PATH));
}

export function issueCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function setCsrfCookie(res: Response, token?: string): string {
  res.clearCookie(env.CSRF_TOKEN_COOKIE_NAME, getCsrfCookieOptions(LEGACY_AUTH_COOKIE_PATH));

  const csrfToken = token ?? issueCsrfToken();
  res.cookie(env.CSRF_TOKEN_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
  return csrfToken;
}

export function clearCsrfCookie(res: Response): void {
  res.clearCookie(env.CSRF_TOKEN_COOKIE_NAME, getCsrfCookieOptions());
  res.clearCookie(env.CSRF_TOKEN_COOKIE_NAME, getCsrfCookieOptions(LEGACY_AUTH_COOKIE_PATH));
}
