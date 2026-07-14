import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error';
import {
  clearCsrfCookie,
  clearRefreshCookie,
  setCsrfCookie,
  setRefreshCookie,
} from '../../shared/utils/auth-cookies';
import { successResponse } from '../../shared/utils/response';
import type { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  getCsrf = async (_req: Request, res: Response): Promise<void> => {
    const csrfToken = setCsrfCookie(res);
    res.status(200).json(successResponse({ csrfToken }));
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    res.status(201).json(successResponse(result));
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.verifyOtp(req.body);
    const csrfToken = this.setSessionCookies(res, result.tokens.refreshToken);

    res.status(200).json(
      successResponse({
        user: result.user,
        accessToken: result.tokens.accessToken,
        csrfToken,
      }),
    );
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.resendOtp(req.body);
    res.status(200).json(successResponse(result));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    const csrfToken = this.setSessionCookies(res, result.tokens.refreshToken);

    res.status(200).json(
      successResponse({
        user: result.user,
        accessToken: result.tokens.accessToken,
        csrfToken,
      }),
    );
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies[env.REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token not found');
      }

      const result = await this.authService.refresh(refreshToken);
      const csrfToken = this.setSessionCookies(res, result.tokens.refreshToken);

      res.status(200).json(
        successResponse({
          user: result.user,
          accessToken: result.tokens.accessToken,
          csrfToken,
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      await this.authService.logout(req.user.id);
    }

    clearRefreshCookie(res);
    clearCsrfCookie(res);
    res.status(200).json(successResponse({ message: 'Logged out successfully' }));
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await this.authService.updateProfile(req.user.id, req.body);
    res.status(200).json(successResponse(user));
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.forgotPassword(req.body);
    res.status(200).json(successResponse(result));
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.resetPassword(req.body);
    res.status(200).json(successResponse(result));
  };

  private setSessionCookies(res: Response, refreshToken: string): string {
    setRefreshCookie(res, refreshToken);
    return setCsrfCookie(res);
  }
}
