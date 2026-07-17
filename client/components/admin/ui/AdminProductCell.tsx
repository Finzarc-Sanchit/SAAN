'use client';

import { AdminProductThumb } from '@/components/admin/ui/AdminProductThumb';
import { cn } from '@/lib/utils';

type AdminProductCellProps = {
  imageUrl: string | null | undefined;
  name: string;
  subtitle: string;
  className?: string;
};

/** Shared product identity: one thumb image left of name + muted subtitle. */
export function AdminProductCell({
  imageUrl,
  name,
  subtitle,
  className,
}: AdminProductCellProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <AdminProductThumb
        src={imageUrl}
        alt=""
        className="h-12 w-12 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex flex-col justify-center">
        <p className="truncate font-body text-sm font-semibold text-saan-charcoal dark:text-paper">
          {name}
        </p>
        <p className="mt-0.5 truncate font-body text-xs text-saan-ink/45 dark:text-paper/45">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
