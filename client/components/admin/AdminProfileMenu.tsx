'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, CircleUser, LogOut } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

type AdminProfileMenuProps = {
  displayName: string;
  email: string;
  initials: string;
};

export function AdminProfileMenu({ displayName, email, initials }: AdminProfileMenuProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
      await logout();
      setOpen(false);
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div ref={menuRef} className="relative ml-1 border-l border-saan-champagne/50 pl-3 dark:border-white/10">
      <button
        type="button"
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-saan-bone dark:hover:bg-white/10"
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saan-maroon/10 font-body text-xs font-bold text-saan-maroon dark:bg-saan-gold/20 dark:text-saan-gold',
          )}
          aria-hidden
        >
          {initials}
        </div>
        <div className="hidden min-w-0 text-left sm:block">
          <p className="truncate font-body text-sm font-medium text-saan-charcoal dark:text-saan-bone">
            {displayName}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'hidden h-4 w-4 shrink-0 text-saan-ink/50 transition-transform dark:text-saan-bone/50 sm:block',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Profile"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-saan-champagne/60 bg-white shadow-lg dark:border-white/10 dark:bg-[#1a1c1a]"
        >
          <div className="border-b border-saan-champagne/50 px-4 py-3 dark:border-white/10">
            <p className="truncate font-body text-sm font-semibold text-saan-charcoal dark:text-saan-bone">
              {displayName}
            </p>
            <p className="mt-0.5 truncate font-body text-xs text-saan-ink/55 dark:text-saan-bone/55">
              {email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/admin/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 font-body text-sm text-saan-charcoal transition-colors hover:bg-saan-bone/80 dark:text-saan-bone dark:hover:bg-white/5"
            >
              <CircleUser className="h-[18px] w-[18px] text-saan-ink/60 dark:text-saan-bone/60" strokeWidth={1.5} />
              Edit profile
            </Link>
          </div>

          <div className="border-t border-saan-champagne/50 py-1 dark:border-white/10">
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-3 px-4 py-2.5 font-body text-sm text-saan-charcoal transition-colors hover:bg-saan-bone/80 disabled:opacity-50 dark:text-saan-bone dark:hover:bg-white/5"
            >
              <LogOut className="h-[18px] w-[18px] text-saan-ink/60 dark:text-saan-bone/60" strokeWidth={1.5} />
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
