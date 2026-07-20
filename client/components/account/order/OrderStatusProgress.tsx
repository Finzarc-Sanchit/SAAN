import {
  getActiveOrderStepIndex,
  ORDER_STATUS_STEPS,
} from '@/lib/account/order-ui';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types/order';

type OrderStatusProgressProps = {
  status: OrderStatus;
};

export function OrderStatusProgress({ status }: OrderStatusProgressProps) {
  if (status === 'cancelled') {
    return (
      <p className="text-caption uppercase tracking-[0.14em] text-neutral-500">
        Order cancelled
      </p>
    );
  }

  const activeIndex = getActiveOrderStepIndex(status);

  return (
    <ol
      className="flex flex-wrap items-center gap-x-2 gap-y-3 sm:gap-x-0"
      aria-label="Order progress"
    >
      {ORDER_STATUS_STEPS.map((step, index) => {
        const isComplete = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <li key={step.key} className="flex items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  'flex h-2 w-2 shrink-0 rounded-full transition-colors',
                  isComplete ? 'bg-ink' : 'bg-neutral-300',
                  isCurrent && 'ring-2 ring-ink/20 ring-offset-2 ring-offset-paper',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'text-caption uppercase tracking-[0.12em]',
                  isComplete ? 'text-ink' : 'text-neutral-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < ORDER_STATUS_STEPS.length - 1 ? (
              <span
                className={cn(
                  'mx-3 hidden h-px w-8 sm:inline-block md:w-12',
                  index < activeIndex ? 'bg-ink/30' : 'bg-neutral-200',
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
