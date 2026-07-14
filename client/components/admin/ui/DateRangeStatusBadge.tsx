'use client';

import { cn } from '@/lib/utils';
import type { DateRangeStatus } from '@/lib/admin/date-range-status';

const STATUS_STYLES: Record<DateRangeStatus, string> = {
  active:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  upcoming:
    'bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  expired:
    'bg-saan-champagne/40 text-saan-ink/70 dark:bg-white/10 dark:text-saan-bone/70',
};

const STATUS_LABELS: Record<DateRangeStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  expired: 'Expired',
};

export function DateRangeStatusBadge({ status }: { status: DateRangeStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
