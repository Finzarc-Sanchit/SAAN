'use client';

import { cn } from '@/lib/utils';
import { AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';

export type AdminTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

type AdminDataTableProps<T> = {
  columns: AdminTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  skeletonRows?: number;
};

export function AdminDataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  errorMessage,
  onRetry,
  emptyMessage = 'No records yet.',
  skeletonRows = 5,
}: AdminDataTableProps<T>) {
  if (errorMessage) {
    return (
      <div className="rounded-xl border border-saan-champagne/40 px-4 py-8 text-center dark:border-white/10">
        <AdminInlineError message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-saan-champagne/40 dark:border-white/10">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-saan-champagne/40 bg-saan-bone/60 dark:border-white/10 dark:bg-white/5">
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  'px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50 dark:text-saan-bone/50',
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: skeletonRows }, (_, index) => (
              <tr
                key={`skeleton-${index}`}
                className="border-b border-saan-champagne/30 last:border-0 dark:border-white/5"
              >
                {columns.map((column) => (
                  <td key={column.id} className={cn('px-4 py-3.5', column.className)}>
                    <AdminSkeleton className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center font-body text-sm text-saan-ink/50 dark:text-saan-bone/50"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-saan-champagne/30 last:border-0 dark:border-white/5"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'px-4 py-3.5 font-body text-sm text-saan-charcoal dark:text-saan-bone',
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
