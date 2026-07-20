import { formatAccountStatus } from '@/lib/account-format';
import { orderStatusTone } from '@/lib/account/order-ui';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types/order';

type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex border px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase',
        orderStatusTone(status),
        className,
      )}
    >
      {formatAccountStatus(status)}
    </span>
  );
}
