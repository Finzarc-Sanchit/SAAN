'use client';

import { Heart, Search, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MobileNav } from '@/components/layout/MobileNav';
import { AccountMenu } from '@/components/layout/AccountMenu';
import { SaanLogo } from '@/components/layout/SaanLogo';
import { TextLink } from '@/components/ui/TextLink';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/hooks/useWishlist';
import { NAV_LINKS } from '@/lib/site-content';
import { SAANLABEL_COLLECTIONS } from '@/lib/saanlabel-images';
import { cn } from '@/lib/utils';

const SHOP_PANEL_ITEMS = [
  {
    label: 'Co-ord Sets',
    href: '/shop?category=Co-ords',
    image: SAANLABEL_COLLECTIONS.coordSets,
  },
  {
    label: 'Western Wear',
    href: '/shop?category=Dresses',
    image: SAANLABEL_COLLECTIONS.westernWear,
  },
  {
    label: 'Ethnic Wear',
    href: '/shop?category=Anarkalis',
    image: SAANLABEL_COLLECTIONS.ethnicWear,
  },
] as const;

const iconClass = 'h-[18px] w-[18px] text-ink';
const actionClass = 'transition-opacity duration-300 hover:opacity-60';

function WishlistLink({
  className,
  tone = 'dark',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const { count } = useWishlist();
  const isLight = tone === 'light';

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist, ${count} items`}
      className={cn('relative flex items-center gap-1.5', actionClass, className)}
    >
      <Heart
        className={cn(iconClass, isLight && 'text-paper')}
        strokeWidth={1.25}
      />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center bg-signature px-1 text-[10px] font-medium text-paper">
          {count}
        </span>
      )}
    </Link>
  );
}

function CartButton({
  className,
  tone = 'dark',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const { count, openCart, lastAddedAt } = useCart();
  const [pop, setPop] = useState(false);
  const isLight = tone === 'light';

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
      <ShoppingBag
        className={cn(iconClass, isLight && 'text-paper')}
        strokeWidth={1.25}
      />
      {count > 0 && (
        <span
          className={cn(
            'absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center bg-signature px-1 text-[10px] font-medium text-paper',
            pop && 'animate-cart-pop'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ShopNavPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="absolute left-1/2 top-full z-50 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 border border-neutral-300 bg-paper pt-6"
      onMouseLeave={onClose}
    >
      <div className="grid grid-cols-3 gap-px bg-neutral-300">
        {SHOP_PANEL_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="group relative flex flex-col bg-paper"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="240px"
                className="object-cover transition-opacity duration-500 group-hover:opacity-85"
              />
            </div>
            <span className="px-4 py-4 text-ui text-ink">{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="border-t border-neutral-300 px-6 py-4">
        <TextLink href="/shop" onNavigate={onClose} className="text-neutral-700">
          Shop All
        </TextLink>
      </div>
    </div>
  );
}

type HeaderProps = {
  variant?: 'default' | 'midnight';
};

export function Header({ variant = 'default' }: HeaderProps) {
  const isMidnight = variant === 'midnight';

  return (
    <header
      className={cn(
        'fixed top-0 z-40 w-full border-b',
        isMidnight
          ? 'border-neutral-700/40 bg-midnight text-paper'
          : 'border-neutral-300 bg-paper text-ink'
      )}
    >
      <div className="relative mx-auto grid h-16 w-full max-w-[var(--container-max)] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 md:h-[72px] lg:px-10 xl:px-12">
        <div className="justify-self-start">
          <SaanLogo variant={isMidnight ? 'light' : 'default'} />
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <TextLink
              key={link.href}
              href={link.href}
              className={isMidnight ? 'text-paper' : undefined}
            >
              {link.label}
            </TextLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-5">
          <div className="hidden items-center gap-5 md:flex">
            <button type="button" aria-label="Search" className={actionClass}>
              <Search
                className={cn(iconClass, isMidnight && 'text-paper')}
                strokeWidth={1.25}
              />
            </button>
            <AccountMenu tone={isMidnight ? 'light' : 'dark'} />
            <WishlistLink tone={isMidnight ? 'light' : 'dark'} />
            <CartButton tone={isMidnight ? 'light' : 'dark'} />
          </div>

          <div className="absolute right-2 top-0 flex h-16 items-center gap-3 sm:right-3 md:hidden">
            <AccountMenu tone={isMidnight ? 'light' : 'dark'} />
            <WishlistLink tone={isMidnight ? 'light' : 'dark'} />
            <CartButton tone={isMidnight ? 'light' : 'dark'} />
            <MobileNav tone={isMidnight ? 'light' : 'dark'} />
          </div>
        </div>
      </div>
    </header>
  );
}
