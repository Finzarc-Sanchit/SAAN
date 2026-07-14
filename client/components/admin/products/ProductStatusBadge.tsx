'use client';

import { cn } from '@/lib/utils';
import type { ProductStatus } from '@/lib/types/product';

const STATUS_STYLES: Record<ProductStatus, string> = {
  draft:
    'bg-saan-champagne/40 text-saan-ink/80 dark:bg-white/10 dark:text-saan-bone/80',
  active:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  archived:
    'bg-saan-maroon/10 text-saan-maroon dark:bg-red-500/15 dark:text-red-300',
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
