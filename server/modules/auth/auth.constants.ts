export const AUTH_CONSTANTS = {
  MAX_OTP_ATTEMPTS: 5,
  OTP_LENGTH: 6,
} as const;

export const GENERIC_OTP_ERROR = 'Invalid or expired OTP';
export const GENERIC_RESET_ERROR = 'Invalid or expired reset link';
export const GENERIC_ACCOUNT_MESSAGE = 'If an account exists, an OTP has been sent';
export const GENERIC_RESET_MESSAGE = 'If an account exists, a reset link has been sent';
export const UNVERIFIED_LOGIN_MESSAGE = 'Please verify your email before logging in';
export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';
