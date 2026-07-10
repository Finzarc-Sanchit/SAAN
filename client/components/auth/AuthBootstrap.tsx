'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { buildAuthPageUrl } from '@/lib/auth/auth-page';

export function AuthBootstrap() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get('returnTo');

    if (searchParams.get('login') === '1') {
      router.replace(buildAuthPageUrl('login', { returnTo }));
      return;
    }

    if (sessionStorage.getItem('saan-open-login') === '1') {
      sessionStorage.removeItem('saan-open-login');
      router.replace(buildAuthPageUrl('login', { returnTo }));
    }
  }, [router, searchParams]);

  return null;
}
