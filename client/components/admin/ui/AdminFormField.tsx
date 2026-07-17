'use client';

import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminFormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminFieldError({
  error,
  id,
  className,
}: {
  error?: string;
  id?: string;
  className?: string;
}) {
  if (!error) return null;

  return (
    <p
      id={id}
      className={cn(
        'flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 font-body text-xs font-medium text-red-700 dark:border-red-500/25 dark:bg-red-950/25 dark:text-red-300',
        className,
      )}
      role="alert"
    >
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

export function AdminFormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: AdminFormFieldProps) {
  return (
    <div
      data-invalid={error ? 'true' : undefined}
      className={cn(
        'space-y-1.5',
        '[&[data-invalid=true]>label]:text-red-700 dark:[&[data-invalid=true]>label]:text-red-300',
        '[&[data-invalid=true]_input]:border-red-600 [&[data-invalid=true]_select]:border-red-600 [&[data-invalid=true]_textarea]:border-red-600',
        '[&[data-invalid=true]_input]:bg-red-50/60 [&[data-invalid=true]_select]:bg-red-50/60 [&[data-invalid=true]_textarea]:bg-red-50/60',
        '[&[data-invalid=true]_input]:ring-2 [&[data-invalid=true]_select]:ring-2 [&[data-invalid=true]_textarea]:ring-2',
        '[&[data-invalid=true]_input]:ring-red-600/15 [&[data-invalid=true]_select]:ring-red-600/15 [&[data-invalid=true]_textarea]:ring-red-600/15',
        'dark:[&[data-invalid=true]_input]:border-red-400 dark:[&[data-invalid=true]_select]:border-red-400 dark:[&[data-invalid=true]_textarea]:border-red-400',
        'dark:[&[data-invalid=true]_input]:bg-red-950/20 dark:[&[data-invalid=true]_select]:bg-red-950/20 dark:[&[data-invalid=true]_textarea]:bg-red-950/20',
        'dark:[&[data-invalid=true]_input]:ring-red-400/20 dark:[&[data-invalid=true]_select]:ring-red-400/20 dark:[&[data-invalid=true]_textarea]:ring-red-400/20',
        className,
      )}
    >
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 transition-colors dark:text-paper/55"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p
          id={`${htmlFor}-hint`}
          className="font-body text-xs text-saan-ink/45 dark:text-paper/45"
        >
          {hint}
        </p>
      ) : null}
      <AdminFieldError id={`${htmlFor}-error`} error={error} />
    </div>
  );
}

export const adminInputClassName = cn(
  'w-full rounded-lg border border-saan-champagne/70 bg-white px-3 py-2.5 font-body text-sm text-saan-charcoal outline-none transition-colors',
  'placeholder:text-saan-ink/35 focus:border-saan-maroon/40 focus:ring-2 focus:ring-saan-maroon/15',
  'disabled:cursor-not-allowed disabled:bg-paper/80 disabled:text-saan-ink/50',
  'dark:border-white/15 dark:bg-[#121412] dark:text-paper dark:placeholder:text-paper/35',
  'dark:focus:border-ink/40 dark:focus:ring-ink/15 dark:disabled:bg-white/5',
);
