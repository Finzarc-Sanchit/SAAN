'use client';

import { cn } from '@/lib/utils';

type AdminButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type AdminButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
  isLoading?: boolean;
};

const VARIANT_CLASSES: Record<AdminButtonVariant, string> = {
  primary:
    'bg-saan-maroon text-paper hover:bg-saan-maroon/90 disabled:bg-saan-maroon/40 dark:bg-ink dark:text-saan-charcoal dark:hover:bg-ink/90',
  secondary:
    'border border-saan-champagne/70 bg-white text-saan-charcoal hover:bg-paper disabled:opacity-50 dark:border-white/15 dark:bg-transparent dark:text-paper dark:hover:bg-white/5',
  ghost:
    'text-ink hover:bg-saan-maroon/5 disabled:opacity-40 dark:text-ink dark:hover:bg-ink/10',
  danger:
    'border border-saan-maroon/30 text-ink hover:bg-saan-maroon/5 disabled:opacity-40 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-400/10',
};

export function AdminButton({
  variant = 'primary',
  isLoading = false,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-body text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saan-maroon disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      )}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? 'Working…' : children}
    </button>
  );
}
