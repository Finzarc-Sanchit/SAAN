'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2 } from 'lucide-react';
import { NewsletterComposer } from '@/components/admin/newsletter/NewsletterComposer';
import { NewsletterHistory } from '@/components/admin/newsletter/NewsletterHistory';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { ModalShell } from '@/components/ui/ModalShell';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatAdminDate } from '@/lib/admin/date-range-status';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  deleteAdminNewsletter,
  listAdminNewsletter,
  newsletterQueryKeys,
  updateAdminNewsletterStatus,
} from '@/lib/api/newsletter';
import {
  NEWSLETTER_STATUSES,
  type NewsletterStatus,
  type NewsletterSubscriber,
} from '@/lib/types/newsletter.schemas';
import { cn } from '@/lib/utils';

const PAGE_LIMIT = 20;

function NewsletterStatusBadge({ status }: { status: NewsletterStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        status === 'active'
          ? 'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300'
          : 'bg-saan-champagne/45 text-saan-ink/65 dark:bg-white/10 dark:text-paper/65',
      )}
    >
      {status}
    </span>
  );
}

export function NewsletterPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<NewsletterStatus | 'all'>('all');
  const [pendingDelete, setPendingDelete] = useState<NewsletterSubscriber | null>(null);
  const debouncedSearch = useDebouncedValue(search, 400);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      status: status === 'all' ? undefined : status,
    }),
    [debouncedSearch, page, status],
  );

  const listQuery = useQuery({
    queryKey: newsletterQueryKeys.list(listParams),
    queryFn: () => listAdminNewsletter(listParams),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      nextStatus,
    }: {
      id: string;
      nextStatus: NewsletterStatus;
    }) => updateAdminNewsletterStatus(id, { status: nextStatus }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: newsletterQueryKeys.all });
      toast('Subscription status updated');
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError
          ? getApiErrorMessage(error)
          : 'Could not update subscription status',
        'error',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminNewsletter,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: newsletterQueryKeys.all });
      toast('Subscriber deleted');
      setPendingDelete(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not delete subscriber',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<NewsletterSubscriber>[]>(
    () => [
      {
        id: 'email',
        header: 'Email',
        cell: (row) => (
          <a
            href={`mailto:${row.email}`}
            className="font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30"
          >
            {row.email}
          </a>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <NewsletterStatusBadge status={row.status} />,
      },
      {
        id: 'source',
        header: 'Source',
        cell: (row) => <span className="capitalize">{row.source}</span>,
      },
      {
        id: 'date',
        header: 'Subscribed',
        cell: (row) => (
          <time
            dateTime={row.subscribedAt}
            className="whitespace-nowrap text-saan-ink/70 dark:text-paper/70"
          >
            {formatAdminDate(row.subscribedAt)}
          </time>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => {
          const nextStatus: NewsletterStatus =
            row.status === 'active' ? 'unsubscribed' : 'active';
          return (
            <div className="inline-flex items-center justify-end gap-1">
              <AdminButton
                variant="ghost"
                className="px-2 py-1.5"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ id: row.id, nextStatus })}
                aria-label={`Mark ${row.email} as ${nextStatus}`}
              >
                <RefreshCw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                {nextStatus === 'active' ? 'Activate' : 'Unsubscribe'}
              </AdminButton>
              <AdminButton
                variant="danger"
                className="px-2 py-1.5"
                onClick={() => setPendingDelete(row)}
                aria-label={`Delete subscriber ${row.email}`}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Delete
              </AdminButton>
            </div>
          );
        },
      },
    ],
    [statusMutation],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
          Community
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          Newsletter
        </h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 lg:gap-6">
        <NewsletterComposer />
        <NewsletterHistory />
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Search
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Email address…"
              className={adminInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as NewsletterStatus | 'all');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="all">All statuses</option>
              {NEWSLETTER_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option === 'active' ? 'Active' : 'Unsubscribed'}
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
                : 'Could not load newsletter subscribers'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No subscribers match these filters."
        />

        {(listQuery.data?.meta.total ?? 0) > 0 && (
          <AdminPagination
            page={page}
            limit={PAGE_LIMIT}
            total={listQuery.data?.meta.total ?? 0}
            onPageChange={setPage}
          />
        )}
      </AdminCard>

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete subscriber"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70">
            Permanently delete{' '}
            <span className="font-medium text-saan-charcoal">
              {pendingDelete?.email ?? 'this subscriber'}
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
                if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
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
