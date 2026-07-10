import type { ApiErrorBody } from '@/lib/types/api';

export class ApiError extends Error {
  public readonly code: string;
  public readonly details: ApiErrorBody['details'];

  constructor(code: string, message: string, details: ApiErrorBody['details'] = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check the highlighted fields and try again.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  CONFLICT: 'This email is already registered.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a moment and try again.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again shortly.',
};

const MESSAGE_OVERRIDES: Record<string, string> = {
  'Please verify your email before logging in':
    'Please verify your email before signing in.',
  'Invalid email or password': 'The email or password you entered is incorrect.',
  'Invalid or expired OTP': 'That code is invalid or has expired.',
  'Invalid or expired reset link': 'This reset link is invalid or has expired.',
};

export function getApiErrorMessage(error: ApiError): string {
  if (MESSAGE_OVERRIDES[error.message]) {
    return MESSAGE_OVERRIDES[error.message]!;
  }

  return ERROR_MESSAGES[error.code] ?? error.message;
}

export function isUnverifiedLoginError(error: ApiError): boolean {
  return error.message === 'Please verify your email before logging in';
}

export function getFieldErrors(error: ApiError): Record<string, string> {
  return error.details.reduce<Record<string, string>>((acc, detail) => {
    const field = detail.field || '_form';
    if (!acc[field]) {
      acc[field] = detail.message;
    }
    return acc;
  }, {});
}
