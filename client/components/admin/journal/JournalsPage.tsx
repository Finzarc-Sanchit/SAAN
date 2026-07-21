'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import { AdminProductThumb } from '@/components/admin/ui/AdminProductThumb';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { ModalShell } from '@/components/ui/ModalShell';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatAdminDate } from '@/lib/admin/date-range-status';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  deleteJournal,
  journalQueryKeys,
  listAdminJournals,
} from '@/lib/api/journal';
import {
  JOURNAL_CATEGORIES,
  JOURNAL_STATUSES,
  type Journal,
  type JournalCategory,
  type JournalStatus,
} from '@/lib/types/journal';
import { cn } from '@/lib/utils';

const PAGE_LIMIT = 20;

function JournalStatusBadge({ status }: { status: JournalStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        status === 'published'
          ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
          : status === 'archived'
            ? 'bg-neutral-500/15 text-neutral-700 dark:bg-white/10 dark:text-paper/55'
            : 'bg-saan-champagne/45 text-saan-ink/65 dark:bg-white/10 dark:text-paper/65',
      )}
    >
      {status}
    </span>
  );
}

export function JournalsPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JournalStatus | 'all'>('all');
  const [category, setCategory] = useState<JournalCategory | 'all'>('all');
  const [pendingDelete, setPendingDelete] = useState<Journal | null>(null);
  const debouncedSearch = useDebouncedValue(search, 400);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      status: status === 'all' ? undefined : status,
      category: category === 'all' ? undefined : category,
    }),
    [category, debouncedSearch, page, status],
  );

  const listQuery = useQuery({
    queryKey: journalQueryKeys.list(listParams),
    queryFn: () => listAdminJournals(listParams),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: journalQueryKeys.all });
      toast('Journal article deleted');
      setPendingDelete(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'Could not delete journal article',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<Journal>[]>(
    () => [
      {
        id: 'image',
        header: 'Cover',
        cell: (row) => (
          <AdminProductThumb
            src={row.imageUrl}
            alt=""
            className="h-12 w-16 rounded-md"
          />
        ),
      },
      {
        id: 'title',
        header: 'Article',
        cell: (row) => (
          <div className="min-w-48">
            <p className="font-medium">{row.title}</p>
            <p className="mt-0.5 text-xs text-saan-ink/45 dark:text-paper/45">
              {row.slug}
            </p>
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: (row) => (
          <span className="whitespace-nowrap text-saan-ink/70 dark:text-paper/70">
            {row.category}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <JournalStatusBadge status={row.status} />,
      },
      {
        id: 'featured',
        header: 'Featured',
        cell: (row) =>
          row.featured ? (
            <span className="inline-flex items-center gap-1 text-sm text-saan-charcoal dark:text-paper">
              <Check
                className="h-4 w-4 text-emerald-700 dark:text-emerald-300"
                aria-hidden="true"
              />
              Yes
            </span>
          ) : (
            <span className="text-saan-ink/45 dark:text-paper/45">No</span>
          ),
      },
      {
        id: 'read',
        header: 'Read',
        cell: (row) => (
          <span className="tabular-nums text-saan-ink/70 dark:text-paper/70">
            {row.readMinutes} min
          </span>
        ),
      },
      {
        id: 'updated',
        header: 'Updated',
        cell: (row) => (
          <span className="whitespace-nowrap text-saan-ink/70 dark:text-paper/70">
            {formatAdminDate(row.updatedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => (
          <div className="inline-flex items-center justify-end gap-1">
            <Link
              href={`/admin/journal/${row.id}/edit`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-body text-sm text-ink transition-colors hover:bg-saan-maroon/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 dark:text-ink dark:hover:bg-ink/10 dark:focus-visible:ring-ink/30"
              aria-label={`Edit ${row.title}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Edit
            </Link>
            <AdminButton
              variant="danger"
              className="px-2 py-1.5"
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete ${row.title}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Delete
            </AdminButton>
          </div>
        ),
      },
    ],
    [],
  );

  const total = listQuery.data?.meta.total ?? 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
            Content
          </p>
          <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
            Journal
          </h1>
        </div>
        <Link
          href="/admin/journal/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-saan-maroon px-4 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-saan-maroon/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 focus-visible:ring-offset-2 dark:bg-ink dark:text-saan-charcoal dark:hover:bg-ink/90 dark:focus-visible:ring-ink/30"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Add article
        </Link>
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/45 dark:text-paper/45">
              Search
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Title, excerpt, or slug"
              className={adminInputClassName}
              aria-label="Search journal articles"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/45 dark:text-paper/45">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as JournalStatus | 'all');
                setPage(1);
              }}
              className={adminInputClassName}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {JOURNAL_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/45 dark:text-paper/45">
              Category
            </span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as JournalCategory | 'all');
                setPage(1);
              }}
              className={adminInputClassName}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {JOURNAL_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <AdminDataTable
          columns={columns}
          data={listQuery.data?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={listQuery.isLoading}
          errorMessage={
            listQuery.isError
              ? listQuery.error instanceof ApiError
                ? getApiErrorMessage(listQuery.error)
                : 'Could not load journal articles'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No journal articles match these filters."
        />

        {total > 0 ? (
          <div className="mt-4 border-t border-saan-champagne/40 pt-4 dark:border-white/10">
            <AdminPagination
              page={page}
              limit={PAGE_LIMIT}
              total={total}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </AdminCard>

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete article"
        panelClassName="dark:bg-[#161916]"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70 dark:text-paper/70">
            Delete{' '}
            <span className="font-medium text-saan-charcoal dark:text-paper">
              {pendingDelete?.title ?? 'this article'}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <AdminButton
              variant="secondary"
              onClick={() => setPendingDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => {
                if (pendingDelete) void deleteMutation.mutateAsync(pendingDelete.id);
              }}
            >
              Delete
            </AdminButton>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
