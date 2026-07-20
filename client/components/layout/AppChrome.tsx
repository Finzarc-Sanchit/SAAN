'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';

/**
 * Storefront chrome is omitted where a dedicated full-page shell is used.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const isCheckoutRoute =
    pathname === '/checkout' ||
    pathname?.startsWith('/checkout/') ||
    pathname?.startsWith('/order-confirmation/');

  if (isAdminRoute || isCheckoutRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="pt-16 md:pt-[72px]">{children}</div>
      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
}
