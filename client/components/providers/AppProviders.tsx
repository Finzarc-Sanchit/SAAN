'use client';

import { Suspense } from 'react';
import { AuthBootstrap } from '@/components/auth/AuthBootstrap';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { WishlistProvider } from '@/components/providers/WishlistProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <CartProvider>
        <AuthProvider>
          {children}
          <CartDrawer />
          <LoginDialog />
          <Suspense fallback={null}>
            <AuthBootstrap />
          </Suspense>
        </AuthProvider>
      </CartProvider>
    </WishlistProvider>
  );
}
