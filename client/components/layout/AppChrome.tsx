'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MarqueeBar } from '@/components/layout/MarqueeBar';

/**
 * Storefront chrome (marquee / header / footer) is omitted on /admin routes
 * so the admin shell can own the full viewport.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <MarqueeBar />
      <Header />
      {children}
      <Footer />
    </>
  );
}
