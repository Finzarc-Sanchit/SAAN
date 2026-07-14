'use client';

import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NavLink } from '@/components/layout/NavLink';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { ADMIN_DASHBOARD_PATH } from '@/lib/auth/post-auth-redirect';
import { NAV_LINKS } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type MobileNavProps = {
  className?: string;
};

export function MobileNav({ className }: MobileNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount, openCart, lastAddedAt } = useCart();
  const { isAuthenticated, isLoading, user, openLoginDialog, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [cartPop, setCartPop] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!lastAddedAt) return;
    setCartPop(true);
    const timer = window.setTimeout(() => setCartPop(false), 600);
    return () => window.clearTimeout(timer);
  }, [lastAddedAt]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((prev) => !prev)}
        className={cn('text-saan-charcoal transition-opacity hover:opacity-60', className)}
      >
        {open ? (
          <X className="h-[18px] w-[18px]" strokeWidth={1.25} />
        ) : (
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.25} />
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-saan-charcoal/20"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="fixed inset-x-0 top-[calc(32px+4rem)] z-50 border-t border-saan-champagne/40 bg-saan-bone px-5 py-8 shadow-sm md:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              {isAuthenticated && (
                <NavLink
                  href={isAdmin ? ADMIN_DASHBOARD_PATH : '/account'}
                  label={isAdmin ? 'Dashboard' : 'Profile'}
                  onNavigate={() => setOpen(false)}
                />
              )}
            </nav>

            <div className="mt-8 flex items-center gap-6 border-t border-saan-champagne/40 pt-6">
              <button
                type="button"
                aria-label="Search"
                className="text-saan-charcoal transition-opacity hover:opacity-60"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.25} />
              </button>
              {!isLoading && !isAuthenticated && (
                <button
                  type="button"
                  aria-label="Sign in"
                  onClick={() => {
                    openLoginDialog('login');
                    setOpen(false);
                  }}
                  className="text-saan-charcoal transition-opacity hover:opacity-60"
                >
                  <User className="h-[18px] w-[18px]" strokeWidth={1.25} />
                </button>
              )}
              {!isLoading && isAuthenticated && (
                <button
                  type="button"
                  aria-label="Sign out"
                  disabled={isLoggingOut}
                  onClick={() => {
                    void (async () => {
                      setIsLoggingOut(true);
                      try {
                        setOpen(false);
                        await logout();
                        router.replace('/');
                      } finally {
                        setIsLoggingOut(false);
                      }
                    })();
                  }}
                  className="text-label-caps text-saan-charcoal transition-opacity hover:opacity-60 disabled:opacity-50"
                >
                  {isLoggingOut ? '…' : 'Sign out'}
                </button>
              )}
              <Link
                href="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} items`}
                className="relative text-saan-charcoal transition-opacity hover:opacity-60"
                onClick={() => setOpen(false)}
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-saan-maroon px-1 text-[10px] font-bold text-saan-bone">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                aria-label={`Cart, ${cartCount} items`}
                onClick={() => {
                  openCart();
                  setOpen(false);
                }}
                className="relative text-saan-charcoal transition-opacity hover:opacity-60"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.25} />
                {cartCount > 0 && (
                  <span
                    className={cn(
                      'absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-saan-maroon px-1 text-[10px] font-bold text-saan-bone',
                      cartPop && 'animate-cart-pop'
                    )}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
