'use client';

import { ForgotPasswordStep } from '@/components/auth/ForgotPasswordStep';
import { LoginStep } from '@/components/auth/LoginStep';
import { RegisterStep } from '@/components/auth/RegisterStep';
import { VerifyOtpStep } from '@/components/auth/VerifyOtpStep';
import { useAuth } from '@/components/providers/AuthProvider';
import { ModalShell } from '@/components/ui/ModalShell';

const TITLES = {
  login: 'Sign In',
  register: 'Create Account',
  'verify-otp': 'Verify Email',
  'forgot-password': 'Reset Password',
  'forgot-sent': 'Check Your Email',
} as const;

export function LoginDialog() {
  const {
    isDialogOpen,
    dialogStep,
    pendingEmail,
    closeLoginDialog,
    setDialogStep,
  } = useAuth();

  return (
    <ModalShell
      isOpen={isDialogOpen}
      onClose={closeLoginDialog}
      title={TITLES[dialogStep]}
    >
      {dialogStep === 'login' && (
        <LoginStep
          onSwitchRegister={() => setDialogStep('register')}
          onForgotPassword={() => setDialogStep('forgot-password')}
        />
      )}

      {dialogStep === 'register' && (
        <RegisterStep onSwitchLogin={() => setDialogStep('login')} />
      )}

      {dialogStep === 'verify-otp' && pendingEmail && (
        <VerifyOtpStep
          email={pendingEmail}
          onBack={() => setDialogStep('login')}
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
