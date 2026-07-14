'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { AdminToastProvider } from '@/components/admin/ui/AdminToast';
import { AdminThemeProvider } from '@/components/providers/AdminThemeProvider';
import { cn } from '@/lib/utils';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const COLLAPSE_STORAGE_KEY = 'saan-admin-sidebar-collapsed';

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (stored === 'true') {
      setCollapsed(true);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setCollapsed((prev) => {
        const next = !prev;
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
        return next;
      });
      return;
    }
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setMobileOpen(false);
      }
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <AdminThemeProvider>
      <AdminToastProvider>
        <div className="min-h-screen bg-saan-bone text-saan-ink dark:bg-[#0f1110] dark:text-saan-bone">
          <AdminSidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onCloseMobile={closeMobile}
          />
          <div
            className={cn(
              'flex min-h-screen flex-col transition-[padding] duration-300 motion-reduce:transition-none',
              collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64',
            )}
          >
            <AdminTopbar onToggleSidebar={toggleSidebar} sidebarCollapsed={collapsed} />
            <main className="flex-1 p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </AdminToastProvider>
    </AdminThemeProvider>
  );
}
