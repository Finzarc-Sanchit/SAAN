'use client';

import { cn } from '@/lib/utils';

type AdminFormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminFormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: AdminFormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-saan-bone/55"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="font-body text-xs text-saan-ink/45 dark:text-saan-bone/45">{hint}</p>
      ) : null}
      {error ? (
        <p className="font-body text-xs text-saan-maroon dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const adminInputClassName = cn(
  'w-full rounded-lg border border-saan-champagne/70 bg-white px-3 py-2.5 font-body text-sm text-saan-charcoal outline-none transition-colors',
  'placeholder:text-saan-ink/35 focus:border-saan-maroon/40 focus:ring-2 focus:ring-saan-maroon/15',
  'disabled:cursor-not-allowed disabled:bg-saan-bone/80 disabled:text-saan-ink/50',
  'dark:border-white/15 dark:bg-[#121412] dark:text-saan-bone dark:placeholder:text-saan-bone/35',
  'dark:focus:border-saan-gold/40 dark:focus:ring-saan-gold/15 dark:disabled:bg-white/5',
);
