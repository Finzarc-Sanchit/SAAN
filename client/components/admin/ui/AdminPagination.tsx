'use client';

import { AdminButton } from '@/components/admin/ui/AdminButton';
import { cn } from '@/lib/utils';

type AdminPaginationProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function AdminPagination({
  page,
  limit,
  total,
  onPageChange,
  className,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 pt-4 font-body text-sm text-saan-ink/60 dark:text-paper/60',
        className,
      )}
    >
      <p>
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <AdminButton
          variant="secondary"
          className="px-3 py-1.5"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </AdminButton>
        <span className="tabular-nums">
          {page} / {totalPages}
        </span>
        <AdminButton
          variant="secondary"
          className="px-3 py-1.5"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </AdminButton>
      </div>
    </div>
  );
}
