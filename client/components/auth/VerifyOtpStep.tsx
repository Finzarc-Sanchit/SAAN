'use client';

import { useEffect, useState } from 'react';
import type { AuthSession } from '@/lib/types/auth';
import { verifyOtpSchema } from '@/lib/types/auth.schemas';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuth } from '@/components/providers/AuthProvider';
import { CtaButton } from '@/components/ui/CtaButton';
import { Spinner } from '@/components/ui/Spinner';
import { OTP_EXPIRY_SECONDS, OTP_RESEND_COOLDOWN_SECONDS } from '@/lib/api/config';
import * as authApi from '@/lib/api/auth';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';

type VerifyOtpStepProps = {
  email: string;
  onBack?: () => void;
  onSuccess?: (session: AuthSession) => void;
};

export function VerifyOtpStep({ email, onBack, onSuccess }: VerifyOtpStepProps) {
  const { completeAuth } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresIn, setExpiresIn] = useState(OTP_EXPIRY_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (expiresIn <= 0) return;
    const timer = window.setInterval(() => {
      setExpiresIn((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresIn]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = verifyOtpSchema.safeParse({ email, otp });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid code');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await authApi.verifyOtp(parsed.data);
      if (onSuccess) {
        onSuccess(session);
      } else {
        completeAuth(session);
      }
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? getApiErrorMessage(submitError)
          : 'Unable to verify your code.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      await authApi.resendOtp({ email });
      setOtp('');
      setExpiresIn(OTP_EXPIRY_SECONDS);
      setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    } catch (resendError) {
      setError(
        resendError instanceof ApiError
          ? getApiErrorMessage(resendError)
          : 'Unable to resend code.',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-center font-body text-sm text-saan-ink/60">
        Enter the 6-digit code sent to <span className="text-saan-ink">{email}</span>
      </p>

      <OtpInput value={otp} onChange={setOtp} error={error ?? undefined} disabled={isSubmitting} />

      <p className="text-center font-body text-xs text-saan-ink/50">
        {expiresIn > 0 ? `Code expires in ${formatTime(expiresIn)}` : 'Code expired — request a new one'}
      </p>

      <CtaButton type="submit" className="w-full gap-2" disabled={isSubmitting || otp.length !== 6}>
        {isSubmitting ? (
          <>
            <Spinner className="text-white" />
            Verifying
          </>
        ) : (
          'Verify & Continue'
        )}
      </CtaButton>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={isResending || resendCooldown > 0}
          className="text-label-caps text-saan-maroon disabled:opacity-40"
        >
          {isResending
            ? 'Sending…'
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend code'}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="font-body text-xs text-saan-ink/50 hover:text-saan-maroon"
          >
            Back to sign in
          </button>
        )}
      </div>
    </form>
  );
}
