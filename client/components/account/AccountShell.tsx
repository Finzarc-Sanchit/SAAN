'use client';

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
import { cn } from '@/lib/utils';

const ACCOUNT_NAV_ITEMS = [
  { href: '/account', label: 'General information', icon: UserRound },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/orders', label: 'Order history', icon: Package },
] as const;

function AccountShellLoading() {
  return (
    <main className="min-h-screen bg-paper pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pt-10">
      <Container>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-5 h-12 w-72 max-w-full" />
        <div className="mt-10 grid gap-8 sm:mt-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-20">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-96 w-full" />
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
            className="mt-8 inline-flex min-h-11 items-center justify-center bg-ink px-7 text-ui text-paper transition-colors hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Sign in
          </button>
        </Container>
      </main>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <main className="min-h-screen bg-paper pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pb-32 lg:pt-10">
      <Container>
        <header className="border-b border-neutral-300 pb-6 sm:pb-7">
          <p className="text-ui text-neutral-500">My account</p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] leading-none font-medium tracking-[-0.04em] text-ink">
              Welcome, {user.firstName}.
            </h1>
            <Link
              href="/shop"
              className="text-ui text-ink underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-ink"
            >
              Continue shopping
            </Link>
          </div>
        </header>

        <div className="mt-8 grid min-w-0 items-start gap-10 sm:mt-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-20">
          <aside className="lg:sticky lg:top-28">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-ui text-paper">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-body-medium text-ink">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-caption text-neutral-500">{user.email}</p>
              </div>
            </div>

            <nav
              aria-label="Account navigation"
              className="-mx-4 mt-6 flex gap-2 overflow-x-auto border-y border-neutral-300 px-4 py-3 sm:mx-0 sm:px-0 lg:mt-8 lg:flex-col lg:gap-0 lg:overflow-visible"
            >
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
                      'flex min-h-11 shrink-0 items-center gap-3 border-l-2 px-3 text-body transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                      isActive
                        ? 'border-ink bg-neutral-100 text-ink'
                        : 'border-transparent text-neutral-700 hover:bg-neutral-100 hover:text-ink',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.25} aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="mt-4 flex min-h-11 w-full items-center gap-3 px-3 text-body text-neutral-500 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.25} aria-hidden />
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </main>
  );
}
