'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TextLink } from '@/components/ui/TextLink';
import { NAV_LINKS } from '@/lib/site-content';
import { cn } from '@/lib/utils';

type MobileNavProps = {
  className?: string;
  tone?: 'light' | 'dark';
};

export function MobileNav({ className, tone = 'dark' }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isLight = tone === 'light';
  const toggleIconClass = cn(
    'h-[18px] w-[18px]',
    isLight ? 'text-paper' : 'text-ink',
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const menuPanel =
    open && mounted
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-midnight/30 md:hidden"
              onClick={() => setOpen(false)}
            />
            <div
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed inset-x-0 top-16 z-[70] max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-neutral-300 bg-paper px-5 py-8 md:hidden"
            >
              <nav aria-label="Mobile navigation" className="flex flex-col gap-5">
                {NAV_LINKS.map((link) => (
                  <TextLink
                    key={link.href}
                    href={link.href}
                    onNavigate={() => setOpen(false)}
                  >
                    {link.label}
                  </TextLink>
                ))}
                <TextLink href="/wishlist" onNavigate={() => setOpen(false)}>
                  Wishlist
                </TextLink>
              </nav>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((previous) => !previous)}
        className={cn('transition-opacity hover:opacity-60', className)}
      >
        {open ? (
          <X className={toggleIconClass} strokeWidth={1.25} />
        ) : (
          <Menu className={toggleIconClass} strokeWidth={1.25} />
        )}
      </button>

      {menuPanel}
    </>
  );
}
