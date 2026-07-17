'use client';

import { buildAuthPageUrl } from '@/lib/auth/auth-page';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { resetPasswordFormSchema } from '@/lib/types/auth.schemas';
import { AuthPasswordField } from '@/components/auth/AuthPasswordField';
import { CtaButton } from '@/components/ui/CtaButton';
import { Container } from '@/components/ui/Container';
import { Spinner } from '@/components/ui/Spinner';
import * as authApi from '@/lib/api/auth';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="section-py min-h-[70vh] pt-28">
          <div className="mx-auto max-w-lg px-5 text-center font-body text-sm text-saan-ink/60">
            Loading…
          </div>
        </main>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const isLinkValid = useMemo(() => Boolean(email && token), [email, token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = resetPasswordFormSchema.safeParse({
      email,
      token,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString() ?? '_form';
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const { confirmPassword: _unused, ...payload } = parsed.data;
      void _unused;
      await authApi.resetPassword(payload);
      setIsComplete(true);
      window.setTimeout(() => router.push(buildAuthPageUrl('login')), 1500);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(getFieldErrors(error));
        setFormError(getApiErrorMessage(error));
      } else {
        setFormError('Unable to reset your password right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLinkValid) {
    return (
      <main className="section-py min-h-[70vh] pt-28">
        <Container className="max-w-lg text-center">
          <h1 className="text-headline-md text-saan-charcoal">Invalid reset link</h1>
          <p className="mt-4 font-body text-sm text-saan-ink/60">
            This password reset link is invalid or incomplete.
          </p>
          <Link href={buildAuthPageUrl('login')} className="text-label-caps mt-8 inline-block text-ink">
            Return to sign in
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="section-py min-h-[70vh] pt-28">
      <Container className="max-w-lg">
        <h1 className="text-headline-md text-center text-saan-charcoal">Set a new password</h1>
        <p className="mt-4 text-center font-body text-sm text-saan-ink/60">
          Choose a new password for <span className="text-saan-ink">{email}</span>
        </p>

        {isComplete ? (
          <p className="mt-10 text-center font-body text-sm text-saan-ink/60" role="status">
            Password updated. Opening sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <AuthPasswordField
              id="reset-password"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              error={fieldErrors.newPassword}
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            <AuthPasswordField
              id="reset-confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            {formError && (
              <p className="font-body text-sm text-ink" role="alert">
                {formError}
              </p>
            )}

            <CtaButton type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="text-white" />
                  Updating password
                </>
              ) : (
                'Update password'
              )}
            </CtaButton>
          </form>
        )}
      </Container>
    </main>
  );
}
