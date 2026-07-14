'use client';

import { cn } from '@/lib/utils';
import type { DiscountType } from '@/lib/types/discount';

const TYPE_STYLES: Record<DiscountType, string> = {
  percentage:
    'bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  flat: 'bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200',
};

const TYPE_LABELS: Record<DiscountType, string> = {
  percentage: 'Percentage',
  flat: 'Flat',
};

export function DiscountTypeBadge({ type }: { type: DiscountType }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        TYPE_STYLES[type],
      )}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}
