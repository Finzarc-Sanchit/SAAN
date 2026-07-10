import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error';
import { successResponse } from '../../shared/utils/response';
import type { AuthService } from './auth.service';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);

    res.status(201).json(successResponse(result));
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.verifyOtp(req.body);

    this.setRefreshCookie(res, result.tokens.refreshToken);

    res.status(200).json(
      successResponse({
        user: result.user,
        accessToken: result.tokens.accessToken,
      }),
    );
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.resendOtp(req.body);

    res.status(200).json(successResponse(result));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);

    this.setRefreshCookie(res, result.tokens.refreshToken);

    res.status(200).json(
      successResponse({
        user: result.user,
        accessToken: result.tokens.accessToken,
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

      this.setRefreshCookie(res, result.tokens.refreshToken);

      res.status(200).json(
        successResponse({
          user: result.user,
          accessToken: result.tokens.accessToken,
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

    res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });

    res.status(200).json(successResponse({ message: 'Logged out successfully' }));
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.forgotPassword(req.body);

    res.status(200).json(successResponse(result));
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.resetPassword(req.body);

    res.status(200).json(successResponse(result));
  };

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
  }
}
