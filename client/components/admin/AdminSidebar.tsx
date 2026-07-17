'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { ADMIN_NAV_GROUPS } from '@/components/admin/admin-nav';
import { cn } from '@/lib/utils';

type AdminSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function AdminSidebar({ collapsed, mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-saan-charcoal/40 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!mobileOpen}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-saan-champagne/40 bg-white transition-all duration-300 dark:border-white/10 dark:bg-saan-charcoal',
          collapsed ? 'lg:w-[4.5rem]' : 'lg:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'motion-reduce:transition-none',
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-saan-champagne/40 px-4 dark:border-white/10">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2"
            onClick={onCloseMobile}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-saan-maroon text-sm font-bold text-paper">
              S
            </span>
            {!collapsed && (
              <span className="font-display text-lg tracking-[0.2em] text-saan-charcoal dark:text-paper">
                SAAN
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-saan-ink/60 hover:bg-paper lg:hidden dark:text-paper/70 dark:hover:bg-white/10"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.id} className="mb-4">
              {!collapsed && (
                <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
                  {group.label}
                </p>
              )}

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname?.startsWith(`${item.href}/`);

                  if (item.disabled) {
                    return (
                      <li key={item.href}>
                        <span
                          className={cn(
                            'flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-saan-ink/30 dark:text-paper/30',
                            collapsed && 'justify-center px-2',
                          )}
                          title={`${item.label} (coming soon)`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {!collapsed && item.label}
                        </span>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                          collapsed && 'justify-center px-2',
                          isActive
                            ? 'bg-saan-maroon/10 font-medium text-ink dark:bg-ink/15 dark:text-ink'
                            : 'text-saan-ink/70 hover:bg-paper hover:text-saan-charcoal dark:text-paper/70 dark:hover:bg-white/5 dark:hover:text-paper',
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
