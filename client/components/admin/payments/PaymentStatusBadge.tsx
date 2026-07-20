import type { PaymentStatus } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<PaymentStatus, string> = {
  created: 'Created',
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

const STATUS_STYLES: Record<PaymentStatus, string> = {
  created: 'bg-saan-ink/10 text-saan-ink/70 dark:bg-white/10 dark:text-paper/70',
  pending: 'bg-amber-500/10 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200',
  paid: 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  failed: 'bg-red-500/10 text-red-800 dark:bg-red-400/10 dark:text-red-300',
  refunded: 'bg-sky-500/10 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
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
