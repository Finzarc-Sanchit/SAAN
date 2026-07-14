'use client';

import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type AdminAccessGateProps = {
  children: React.ReactNode;
};

/**
 * Client-side admin gate. Shows a bootstrap loading state until auth resolves,
 * then triggers a 404 for non-admins / guests without rendering dashboard content.
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
    notFound();
  }

  return <AdminLayout>{children}</AdminLayout>;
}
