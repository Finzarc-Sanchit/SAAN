'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthSession } from '@/lib/types/auth';
import { AuthModeTabs } from '@/components/auth/AuthModeTabs';
import { ForgotPasswordStep } from '@/components/auth/ForgotPasswordStep';
import { LoginStep } from '@/components/auth/LoginStep';
import { RegisterProgress } from '@/components/auth/RegisterProgress';
import { RegisterStep } from '@/components/auth/RegisterStep';
import { VerifyOtpStep } from '@/components/auth/VerifyOtpStep';
import { useAuth } from '@/components/providers/AuthProvider';
import { Container } from '@/components/ui/Container';
import { AUTH_RETURN_KEY } from '@/lib/api/config';
import {
  buildAuthPageUrl,
  parseAuthPageMode,
  type AuthPageMode,
} from '@/lib/auth/auth-page';
import { useGuestOnly } from '@/hooks/useGuestOnly';
import { applyAuthSession } from '@/lib/auth/csrf';
import { setAccessToken } from '@/lib/auth/token-store';

type RegisterFlowStep = 1 | 2 | 3;

export default function RegisterPage() {
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
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeAuth } = useAuth();
  const { isLoading: isAuthLoading } = useGuestOnly({ redirectTo: '/' });

  const mode = useMemo(
    () => parseAuthPageMode(searchParams.get('mode')),
    [searchParams],
  );

  const returnTo = searchParams.get('returnTo');
  const [flowStep, setFlowStep] = useState<RegisterFlowStep>(1);
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    if (returnTo) {
      sessionStorage.setItem(AUTH_RETURN_KEY, returnTo);
    }
  }, [returnTo]);

  const setMode = useCallback(
    (nextMode: AuthPageMode) => {
      setFlowStep(1);
      router.replace(buildAuthPageUrl(nextMode, { returnTo }), { scroll: false });
    },
    [router, returnTo],
  );

  const redirectAfterAuth = useCallback(() => {
    const destination = sessionStorage.getItem(AUTH_RETURN_KEY) ?? '/';
    sessionStorage.removeItem(AUTH_RETURN_KEY);
    router.push(destination);
  }, [router]);

  const handleRegistered = (email: string) => {
    setPendingEmail(email);
    setFlowStep(2);
  };

  const handleVerified = (session: AuthSession) => {
    setAccessToken(session.accessToken);
    applyAuthSession(session);
    completeAuth(session);
    setFlowStep(3);

    window.setTimeout(() => {
      redirectAfterAuth();
    }, 1800);
  };

  const handleResendVerification = (email: string) => {
    setPendingEmail(email);
    setFlowStep(2);
    if (mode !== 'register') {
      router.replace(buildAuthPageUrl('register', { returnTo }), { scroll: false });
    }
  };

  const heading = (() => {
    if (flowStep === 2) return 'Verify your email';
    if (flowStep === 3) return 'Welcome to SAAN';
    if (mode === 'login') return 'Sign In';
    if (mode === 'forgot-password') return 'Reset Password';
    return 'Join SAAN';
  })();

  if (isAuthLoading) {
    return (
      <main className="section-py min-h-[70vh] pt-28">
        <Container className="max-w-lg text-center">
          <p className="font-body text-sm text-saan-ink/60">Loading…</p>
        </Container>
      </main>
    );
  }

  const isRegisterFlow = mode === 'register' && flowStep > 1;
  const showModeTabs = mode !== 'forgot-password' && flowStep === 1;

  return (
    <main className="section-py min-h-[70vh] pt-28">
      <Container className="max-w-lg">
        {isRegisterFlow && <RegisterProgress currentStep={flowStep} />}

        <h1 className="text-headline-md text-center text-saan-charcoal">{heading}</h1>

        {showModeTabs && (
          <div className="mt-8">
            <AuthModeTabs
              mode={mode === 'login' ? 'login' : 'register'}
              onChange={(nextMode) => setMode(nextMode)}
            />
          </div>
        )}

        {flowStep === 1 && mode === 'login' && (
          <div className={showModeTabs ? '' : 'mt-10'}>
            <LoginStep
              idPrefix="page-login"
              showModeSwitch={false}
              onSwitchRegister={() => setMode('register')}
              onForgotPassword={() => setMode('forgot-password')}
              onSuccess={redirectAfterAuth}
              onResendVerification={handleResendVerification}
            />
          </div>
        )}

        {flowStep === 1 && mode === 'register' && (
          <div className={showModeTabs ? '' : 'mt-10'}>
            <RegisterStep
              idPrefix="page-register"
              showModeSwitch={false}
              onSwitchLogin={() => setMode('login')}
              onRegistered={handleRegistered}
            />
          </div>
        )}

        {flowStep === 1 && mode === 'forgot-password' && (
          <div className="mt-10">
            <ForgotPasswordStep
              onBack={() => setMode('login')}
              onSent={() => setMode('login')}
            />
          </div>
        )}

        {flowStep === 2 && (
          <div className="mt-10">
            <VerifyOtpStep
              email={pendingEmail}
              onBack={() => setFlowStep(1)}
              onSuccess={handleVerified}
            />
          </div>
        )}

        {flowStep === 3 && (
          <p className="mt-10 text-center font-body text-sm text-saan-ink/60" role="status">
            Your account is ready. Taking you back…
          </p>
        )}
      </Container>

      {flowStep === 3 && (
        <div
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-sm bg-saan-charcoal px-5 py-3 text-sm text-saan-bone shadow-lg"
          role="status"
        >
          Welcome to SAAN
        </div>
      )}
    </main>
  );
}
