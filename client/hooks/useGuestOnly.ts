'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getPostAuthPath } from '@/lib/auth/post-auth-redirect';

type UseGuestOnlyOptions = {
  /** Where authenticated customers are sent. */
  redirectTo?: string;
  /** Where authenticated admins are sent (defaults to admin dashboard). */
  adminRedirectTo?: string;
};

export function useGuestOnly({
  redirectTo = '/',
  adminRedirectTo,
}: UseGuestOnlyOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    const destination =
      user.role === 'admin'
        ? (adminRedirectTo ?? getPostAuthPath('admin'))
        : redirectTo;

    router.replace(destination);
  }, [adminRedirectTo, isAuthenticated, isLoading, redirectTo, router, user]);

  return { isLoading, isAuthenticated };
}
