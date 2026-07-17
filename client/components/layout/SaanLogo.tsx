'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SaanLogo({ variant = 'default' }: { variant?: 'default' | 'light' }) {
  return (
    <Link
      href="/"
      className={cn(
        'relative inline-block font-display text-h3 tracking-[0.06em]',
        variant === 'light' ? 'text-paper' : 'text-ink'
      )}
    >
      <span
        aria-hidden
        className="absolute -top-0.5 left-[0.62em] h-1 w-1 bg-ink md:h-1.5 md:w-1.5"
      />
      SAAN
    </Link>
  );
}
