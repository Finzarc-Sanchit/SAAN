'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

type UseGuestOnlyOptions = {
  redirectTo?: string;
};

export function useGuestOnly({ redirectTo = '/' }: UseGuestOnlyOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isLoading, isAuthenticated };
}
