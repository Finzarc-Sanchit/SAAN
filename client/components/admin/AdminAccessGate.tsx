'use client';

import { notFound, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type AdminAccessGateProps = {
  children: React.ReactNode;
};

function RedirectHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-saan-bone">
      <p className="font-body text-sm text-saan-ink/60" role="status">
        Returning home…
      </p>
    </div>
  );
}

/**
 * Client-side admin gate. Shows a bootstrap loading state until auth resolves,
 * then triggers a 404 for authenticated non-admins. Guests / cleared sessions
 * (e.g. logout) are sent home so the dashboard does not flash a 404.
 */
export function AdminAccessGate({ children }: AdminAccessGateProps) {
  const { user, isAuthenticated, isBootstrapping } = useCurrentUser();
  const isAdmin = Boolean(isAuthenticated && user?.role === 'admin');

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-saan-bone">
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <span className="h-8 w-8 animate-pulse rounded-full bg-saan-maroon/20" />
          <p className="font-body text-sm text-saan-ink/60">Preparing atelier admin…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    if (!isAuthenticated) {
      return <RedirectHome />;
    }
    notFound();
  }

  return <AdminLayout>{children}</AdminLayout>;
}
