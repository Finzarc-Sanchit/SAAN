'use client';

import { useRouter } from 'next/navigation';
import { ForgotPasswordStep } from '@/components/auth/ForgotPasswordStep';
import { LoginStep } from '@/components/auth/LoginStep';
import { VerifyOtpStep } from '@/components/auth/VerifyOtpStep';
import { useAuth } from '@/components/providers/AuthProvider';
import { ModalShell } from '@/components/ui/ModalShell';
import { getPostAuthPath } from '@/lib/auth/post-auth-redirect';
import type { AuthSession } from '@/lib/types/auth';

const TITLES = {
  login: 'Sign In',
  register: 'Create Account',
  'verify-otp': 'Verify Email',
  'forgot-password': 'Reset Password',
  'forgot-sent': 'Check Your Email',
} as const;

export function LoginDialog() {
  const router = useRouter();
  const {
    isAuthenticated,
    isDialogOpen,
    dialogStep,
    pendingEmail,
    closeLoginDialog,
    setDialogStep,
    completeAuth,
  } = useAuth();

  const handleAuthSuccess = (session: AuthSession) => {
    completeAuth(session);
    const destination = getPostAuthPath(session.user.role);
    if (destination !== '/') {
      router.push(destination);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <ModalShell
      isOpen={isDialogOpen}
      onClose={closeLoginDialog}
      title={TITLES[dialogStep]}
    >
      {dialogStep === 'login' && (
        <LoginStep
          onSwitchRegister={() => {
            closeLoginDialog();
            router.push('/register');
          }}
          onForgotPassword={() => setDialogStep('forgot-password')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {dialogStep === 'verify-otp' && pendingEmail && (
        <VerifyOtpStep
          email={pendingEmail}
          onBack={() => setDialogStep('login')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {dialogStep === 'forgot-password' && (
        <ForgotPasswordStep
          onBack={() => setDialogStep('login')}
          onSent={() => setDialogStep('forgot-sent')}
        />
      )}

      {dialogStep === 'forgot-sent' && (
        <div className="space-y-6 text-center">
          <p className="font-body text-sm leading-relaxed text-saan-ink/60">
            If an account exists for that email, we&apos;ve sent password reset instructions.
          </p>
          <button
            type="button"
            onClick={() => setDialogStep('login')}
            className="text-label-caps text-saan-maroon underline-offset-2 hover:underline"
          >
            Return to sign in
          </button>
        </div>
      )}
    </ModalShell>
  );
}
