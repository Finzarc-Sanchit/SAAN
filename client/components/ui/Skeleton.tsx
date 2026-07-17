import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
  label?: string;
};

export function Skeleton({ className, label = 'Loading' }: SkeletonProps) {
  return (
    <span
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn('skeleton block', className)}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  className?: string;
};

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3', index === lines - 1 ? 'w-2/3 max-w-[66%]' : 'w-full')}
        />
      ))}
    </div>
  );
}
