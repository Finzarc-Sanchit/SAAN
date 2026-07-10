'use client';

import { AuthModal } from '@/components/layout/AuthModal';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { AuthPanelProvider } from '@/components/providers/AuthPanelProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { WishlistProvider } from '@/components/providers/WishlistProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        <AuthPanelProvider>
          {children}
          <CartDrawer />
          <AuthModal />
        </AuthPanelProvider>
      </CartProvider>
    </WishlistProvider>
  );
}
