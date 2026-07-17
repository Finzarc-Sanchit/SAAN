'use client';

import { cn } from '@/lib/utils';
import type { OrderPaymentStatus, OrderStatus } from '@/lib/types/order';
import { ORDER_STATUS_LABELS } from '@/lib/admin/order-status';

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending:
    'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  confirmed:
    'bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  shipped:
    'bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  delivered:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled:
    'bg-saan-maroon/10 text-ink dark:bg-red-500/15 dark:text-red-300',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        ORDER_STATUS_STYLES[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

const PAYMENT_STATUS_STYLES: Record<OrderPaymentStatus, string> = {
  pending:
    'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  paid: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  failed: 'bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  refunded:
    'bg-saan-champagne/40 text-saan-ink/70 dark:bg-white/10 dark:text-paper/70',
};

const PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

export function OrderPaymentStatusBadge({ status }: { status: OrderPaymentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        PAYMENT_STATUS_STYLES[status],
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
