'use client';

import { Bell, Menu, Moon, RefreshCw, Search, Sun } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminProfileMenu } from '@/components/admin/AdminProfileMenu';
import { useAdminTheme } from '@/components/providers/AdminThemeProvider';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { analyticsQueryKeys } from '@/lib/api/analytics';

type AdminTopbarProps = {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
};

export function AdminTopbar({ onToggleSidebar, sidebarCollapsed }: AdminTopbarProps) {
  const { user } = useCurrentUser();
  const { theme, toggleTheme } = useAdminTheme();
  const queryClient = useQueryClient();

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : 'Admin';
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'A'
    : 'A';

  function handleRefresh() {
    void queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.all });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-saan-champagne/40 bg-white/90 px-4 backdrop-blur-md dark:border-white/10 dark:bg-saan-charcoal/90 lg:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-saan-ink/70 hover:bg-paper dark:text-paper/80 dark:hover:bg-white/10"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden min-w-0 flex-1 md:block md:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-saan-ink/40 dark:text-paper/40" />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search (coming soon)"
          disabled
          className="w-full rounded-lg border border-saan-champagne/50 bg-paper/60 py-2 pl-9 pr-3 font-body text-sm text-saan-ink/50 outline-none dark:border-white/10 dark:bg-white/5 dark:text-paper/50"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-lg p-2 text-saan-ink/70 hover:bg-paper dark:text-paper/80 dark:hover:bg-white/10"
          aria-label="Refresh dashboard data"
        >
          <RefreshCw className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-saan-ink/70 hover:bg-paper dark:text-paper/80 dark:hover:bg-white/10"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          className="relative rounded-lg p-2 text-saan-ink/70 hover:bg-paper dark:text-paper/80 dark:hover:bg-white/10"
          aria-label="Notifications"
          disabled
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-saan-maroon" />
        </button>

        <AdminProfileMenu
          displayName={displayName}
          email={user?.email ?? ''}
          initials={initials}
        />
      </div>
    </header>
  );
}
