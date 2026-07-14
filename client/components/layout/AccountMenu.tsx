'use client';

import { LayoutDashboard, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { ADMIN_DASHBOARD_PATH } from '@/lib/auth/post-auth-redirect';
import { cn } from '@/lib/utils';

const iconClass = 'h-[18px] w-[18px] text-saan-charcoal';
const actionClass = 'transition-opacity duration-300 hover:opacity-60';

type AccountMenuProps = {
  className?: string;
};

export function AccountMenu({ className }: AccountMenuProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, openLoginDialog, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      setOpen(false);
      await logout();
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <span
        className={cn('inline-flex h-[18px] w-[18px] opacity-40', className)}
        aria-hidden
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        aria-label="Sign in"
        onClick={() => openLoginDialog('login')}
        className={cn(actionClass, className)}
      >
        <User className={iconClass} strokeWidth={1.25} />
      </button>
    );
  }

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className={actionClass}
      >
        <User className={iconClass} strokeWidth={1.25} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[11rem] border border-saan-champagne/60 bg-saan-bone py-2 shadow-sm"
        >
          {user && (
            <p className="text-label-caps border-b border-saan-champagne/40 px-4 pb-3 pt-1 text-saan-ink/50">
              {user.firstName}
            </p>
          )}
          {isAdmin ? (
            <Link
              href={ADMIN_DASHBOARD_PATH}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="text-label-caps flex items-center gap-2 px-4 py-2.5 text-saan-charcoal transition-colors hover:bg-saan-champagne/20"
            >
              <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="text-label-caps block px-4 py-2.5 text-saan-charcoal transition-colors hover:bg-saan-champagne/20"
            >
              Profile
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            className="text-label-caps flex w-full items-center gap-2 px-4 py-2.5 text-left text-saan-charcoal transition-colors hover:bg-saan-champagne/20 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.25} aria-hidden />
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
