'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Container } from '@/components/ui/Container';
import { useGuestOnly } from '@/hooks/useGuestOnly';

export default function AccountPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isLoading } = useGuestOnly({ redirectTo: '/' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading || !user) {
    return (
      <main className="section-py min-h-[70vh] pt-28">
        <Container className="max-w-lg text-center">
          <p className="font-body text-sm text-saan-ink/60">Loading…</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="section-py min-h-[70vh] pt-28">
      <Container className="max-w-lg">
        <h1 className="text-headline-md text-center text-saan-charcoal">Profile</h1>
        <p className="mt-4 text-center font-body text-sm text-saan-ink/60">
          Your SAAN account
        </p>

        <dl className="mt-10 space-y-5 border-t border-saan-champagne/60 pt-8">
          <div>
            <dt className="text-label-caps text-saan-ink/50">Name</dt>
            <dd className="mt-1 font-body text-saan-charcoal">
              {user.firstName} {user.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-label-caps text-saan-ink/50">Email</dt>
            <dd className="mt-1 font-body text-saan-charcoal">{user.email}</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-col gap-4 border-t border-saan-champagne/60 pt-8">
          <Link
            href="/shop"
            className="text-label-caps text-center text-saan-maroon underline-offset-2 hover:underline"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="text-label-caps text-saan-ink/60 transition-colors hover:text-saan-maroon disabled:opacity-50"
          >
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </Container>
    </main>
  );
}
