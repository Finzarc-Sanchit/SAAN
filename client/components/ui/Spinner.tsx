import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  label?: string;
};

/** @deprecated Prefer Skeleton for loading states. */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <Skeleton
      className={cn('h-4 w-4', className)}
      label={label}
    />
  );
}
