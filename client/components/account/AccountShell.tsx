'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LogOut,
  MapPin,
  Package,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Container } from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ACCOUNT_LAYOUT_MAX_WIDTH,
  ACCOUNT_PANEL_GRID,
  ACCOUNT_PROFILE_IMAGE,
} from '@/lib/account-ui';
import { cn } from '@/lib/utils';

const ACCOUNT_NAV_ITEMS = [
  {
    href: '/account',
    label: 'General information',
    mobileLabel: 'Profile',
    icon: UserRound,
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    mobileLabel: 'Addresses',
    icon: MapPin,
  },
  {
    href: '/account/orders',
    label: 'Order history',
    mobileLabel: 'Orders',
    icon: Package,
  },
] as const;

function AccountShellLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f1f3f6] pb-10 pt-4 sm:pb-12 sm:pt-6">
      <Container className={cn(ACCOUNT_LAYOUT_MAX_WIDTH, 'min-w-0')}>
        <div className={cn(ACCOUNT_PANEL_GRID, 'min-w-0')}>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full border border-neutral-200 bg-paper" />
            <Skeleton className="h-64 w-full border border-neutral-200 bg-paper" />
          </div>
          <Skeleton className="h-[34rem] w-full border border-neutral-200 bg-paper" />
        </div>
      </Container>
    </main>
  );
}

export function AccountShell({ children }: { children: React.ReactNode; }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    openLoginDialog,
  } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      openLoginDialog('login');
      return;
    }
    if (user.role === 'admin') {
      router.replace('/admin');
    }
  }, [isAuthenticated, isLoading, openLoginDialog, router, user]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return <AccountShellLoading />;
  }

  if (!user || user.role !== 'customer') {
    return (
      <main className="min-h-[70vh] bg-paper pb-20 pt-8 sm:pb-24 sm:pt-10">
        <Container className="max-w-xl text-center">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-none font-medium text-ink">
            Your account
          </h1>
          <p className="mt-5 text-body leading-relaxed text-neutral-700">
            Sign in to view your details, saved addresses, and order history.
          </p>
          <button
            type="button"
            onClick={() => openLoginDialog('login')}
            className="mt-8 inline-flex min-h-11 items-center justify-center bg-ink px-7 text-ui text-paper transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Sign in
          </button>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f1f3f6] pb-10 pt-4 sm:pb-12 sm:pt-6">
      <Container className={cn(ACCOUNT_LAYOUT_MAX_WIDTH, 'min-w-0')}>
        <div className={cn(ACCOUNT_PANEL_GRID, 'min-w-0')}>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="border border-neutral-200 bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                  <Image
                    src={ACCOUNT_PROFILE_IMAGE}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500">Hello,</p>
                  <p className="truncate text-sm font-medium text-ink">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
            </section>

            <nav
              aria-label="Account navigation"
              className="grid grid-cols-3 gap-2 lg:block"
            >
              <div className="hidden border border-neutral-200 bg-paper lg:block">
                {ACCOUNT_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/account'
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex min-h-14 items-center gap-3 border-b border-neutral-200 px-4 text-sm transition-colors last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink',
                        isActive
                          ? 'bg-[#f5faff] font-medium text-[#2874f0]'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-ink',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-[#2874f0]' : 'text-neutral-500',
                        )}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                  className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden />
                  {isLoggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>

              {ACCOUNT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/account'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={`${item.href}-mobile`}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 w-full items-center justify-center gap-1.5 border border-neutral-200 bg-paper px-2 text-center text-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink sm:gap-2 sm:px-3 sm:text-ui lg:hidden',
                      isActive
                        ? 'border-[#2874f0] bg-[#f5faff] text-[#2874f0]'
                        : 'text-neutral-700',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                    <span>{item.mobileLabel}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 overflow-x-hidden border border-neutral-200 bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {children}
          </div>
        </div>
      </Container>
    </main>
  );
}
