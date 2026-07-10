'use client';

import { Heart, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { NavLink } from '@/components/layout/NavLink';
import { SaanLogo } from '@/components/layout/SaanLogo';
import { useAuthPanel } from '@/components/providers/AuthPanelProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { NAV_LINKS } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const MARQUEE_HEIGHT = 32;

const iconClass = 'h-[18px] w-[18px] text-saan-charcoal';
const actionClass = 'transition-opacity duration-300 hover:opacity-60';

function WishlistLink({ className }: { className?: string }) {
  const { count } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${count} items`}
      className={cn('relative flex items-center gap-1.5', actionClass, className)}
    >
      <Heart className={iconClass} strokeWidth={1.25} />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-saan-maroon px-1 text-[10px] font-bold text-saan-bone">
          {count}
        </span>
      )}
    </Link>
  );
}

function CartButton({ className }: { className?: string }) {
  const { count, openCart, lastAddedAt } = useCart();
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!lastAddedAt) return;
    setPop(true);
    const timer = window.setTimeout(() => setPop(false), 600);
    return () => window.clearTimeout(timer);
  }, [lastAddedAt]);

  return (
    <button
      type="button"
      aria-label={`Cart, ${count} items`}
      onClick={openCart}
      className={cn('relative', actionClass, className)}
    >
      <ShoppingBag className={iconClass} strokeWidth={1.25} />
      {count > 0 && (
        <span
          className={cn(
            'absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-saan-maroon px-1 text-[10px] font-bold text-saan-bone',
            pop && 'animate-cart-pop'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function AccountButton({ className }: { className?: string }) {
  const { openAuth } = useAuthPanel();

  return (
    <button
      type="button"
      aria-label="Sign in"
      onClick={() => openAuth('sign-in')}
      className={cn(actionClass, className)}
    >
      <User className={iconClass} strokeWidth={1.25} />
    </button>
  );
}

export function Header() {
  return (
    <header
      style={{ top: MARQUEE_HEIGHT }}
      className="fixed z-40 w-full bg-saan-bone"
    >
      <div className="mx-auto grid h-16 max-w-[var(--container-max)] grid-cols-[1fr_auto_1fr] items-center px-5 md:h-[72px] md:px-8">
        <div className="justify-self-start">
          <SaanLogo />
        </div>

        <nav aria-label="Main navigation" className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center justify-end gap-5">
          <div className="hidden items-center gap-5 md:flex">
            <button type="button" aria-label="Search" className={actionClass}>
              <Search className={iconClass} strokeWidth={1.25} />
            </button>
            <AccountButton />
            <WishlistLink />
            <CartButton />
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <AccountButton />
            <WishlistLink />
            <CartButton />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
