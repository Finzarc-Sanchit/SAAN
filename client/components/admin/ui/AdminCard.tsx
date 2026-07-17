'use client';

import { cn } from '@/lib/utils';

type AdminCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
};

export function AdminCard({ children, className, title, action }: AdminCardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-saan-champagne/40 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#161916]',
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          {title ? (
            <h2 className="font-display text-lg text-saan-charcoal dark:text-paper">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function AdminSkeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block animate-pulse rounded-md bg-saan-champagne/40 dark:bg-white/10 motion-reduce:animate-none',
        className,
      )}
      aria-hidden
    />
  );
}

export function AdminInlineError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 font-body text-xs text-ink dark:text-red-300">
      <span>{message ?? "Couldn't load"}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="underline underline-offset-2 hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
