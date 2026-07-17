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

/** User-facing copy — never expose server paths, env vars, or infra details. */
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check the highlighted fields and try again.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  CONFLICT: 'This action conflicts with existing data.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a moment and try again.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again shortly.',
  SERVICE_UNAVAILABLE:
    'Checkout is temporarily unavailable. Please try again in a moment.',
  STORAGE_ERROR: 'Could not upload this image. Try a JPEG, PNG, or WebP under 5MB.',
  STORAGE_CONFIG_ERROR:
    'Image uploads are temporarily unavailable. Please try again later or contact support.',
};

/** Auth / OTP messages worth preserving verbatim (already user-safe). */
const MESSAGE_OVERRIDES: Record<string, string> = {
  'Please verify your email before logging in':
    'Please verify your email before signing in.',
  'Invalid email or password': 'The email or password you entered is incorrect.',
  'Invalid or expired OTP': 'That code is invalid or has expired.',
  'Invalid or expired reset link': 'This reset link is invalid or has expired.',
  'Invalid CSRF token': 'Your session needs a refresh. Please try again.',
};

/** Backend codes whose `details[]` are safe to show on form fields (user-fixable). */
const FIELD_ERROR_CODES = new Set(['VALIDATION_ERROR']);

export function getApiErrorMessage(error: ApiError): string {
  if (MESSAGE_OVERRIDES[error.message]) {
    return MESSAGE_OVERRIDES[error.message]!;
  }

  // Business conflicts (e.g. duplicate size label) — server message is user-safe.
  if (error.code === 'CONFLICT' && error.message) {
    return error.message;
  }

  // Validation with field details: generic banner; fields use getFieldErrors().
  if (error.code === 'VALIDATION_ERROR' && error.details.length > 0) {
    return ERROR_MESSAGES.VALIDATION_ERROR!;
  }

  return ERROR_MESSAGES[error.code] ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR!;
}

export function isUnverifiedLoginError(error: ApiError): boolean {
  return error.message === 'Please verify your email before logging in';
}

export function getFieldErrors(error: ApiError): Record<string, string> {
  if (!FIELD_ERROR_CODES.has(error.code)) {
    return {};
  }

  return error.details.reduce<Record<string, string>>((acc, detail) => {
    const field = detail.field || '_form';
    if (!acc[field]) {
      acc[field] = detail.message;
    }
    return acc;
  }, {});
}

/** Upload-specific field hints from validation details (wrong file type, too large, etc.). */
export function getUploadFieldError(error: ApiError): string | undefined {
  if (error.code !== 'VALIDATION_ERROR') {
    return undefined;
  }

  const filesDetail = error.details.find((d) => d.field === 'files');
  return filesDetail?.message;
}
