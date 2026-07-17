'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2 } from 'lucide-react';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
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
import {
  contactsQueryKeys,
  deleteAdminContact,
  getAdminContact,
  listAdminContacts,
  updateAdminContactStatus,
} from '@/lib/api/contacts';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  CONTACT_STATUSES,
  type Contact,
  type ContactStatus,
} from '@/lib/types/contact.schemas';
import { cn } from '@/lib/utils';

const PAGE_LIMIT = 20;

const STATUS_LABELS: Record<ContactStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        status === 'new' && 'bg-saan-maroon/10 text-ink dark:text-ink',
        status === 'in_progress' &&
          'bg-amber-500/10 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200',
        status === 'resolved' &&
          'bg-emerald-500/10 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ContactsPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContactStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
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
    queryKey: contactsQueryKeys.list(listParams),
    queryFn: () => listAdminContacts(listParams),
  });

  const detailQuery = useQuery({
    queryKey: contactsQueryKeys.detail(selectedId ?? ''),
    queryFn: () => getAdminContact(selectedId!),
    enabled: Boolean(selectedId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: ContactStatus }) =>
      updateAdminContactStatus(id, { status: nextStatus }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contactsQueryKeys.all });
      toast('Contact status updated');
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not update contact status',
        'error',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contactsQueryKeys.all });
      toast('Contact deleted');
      setPendingDelete(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not delete contact',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<Contact>[]>(
    () => [
      {
        id: 'name',
        header: 'Contact',
        cell: (row) => (
          <div className="min-w-40">
            <p className="font-medium">{row.name}</p>
            <a
              href={`mailto:${row.email}`}
              className="text-xs text-saan-ink/55 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 dark:text-paper/55"
            >
              {row.email}
            </a>
          </div>
        ),
      },
      {
        id: 'subject',
        header: 'Subject',
        cell: (row) => <span className="line-clamp-2 min-w-44">{row.subject}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => (
          <div className="space-y-2">
            <StatusBadge status={row.status} />
            <label className="block">
              <span className="sr-only">Change status for {row.name}</span>
              <select
                value={row.status}
                disabled={statusMutation.isPending}
                onChange={(event) =>
                  statusMutation.mutate({
                    id: row.id,
                    nextStatus: event.target.value as ContactStatus,
                  })
                }
                className="block rounded-md border border-saan-champagne/70 bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 disabled:opacity-50 dark:border-white/15"
              >
                {CONTACT_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ),
      },
      {
        id: 'date',
        header: 'Received',
        cell: (row) => (
          <time dateTime={row.createdAt} className="whitespace-nowrap text-saan-ink/70 dark:text-paper/70">
            {formatAdminDate(row.createdAt)}
          </time>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => (
          <div className="inline-flex items-center justify-end gap-1">
            <AdminButton
              variant="ghost"
              className="px-2 py-1.5"
              onClick={() => setSelectedId(row.id)}
              aria-label={`View message from ${row.name}`}
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              View
            </AdminButton>
            <AdminButton
              variant="danger"
              className="px-2 py-1.5"
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete message from ${row.name}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Delete
            </AdminButton>
          </div>
        ),
      },
    ],
    [statusMutation],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
          Correspondence
        </p>
        <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          Contacts
        </h1>
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
              placeholder="Name, email or subject…"
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
                setStatus(event.target.value as ContactStatus | 'all');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="all">All messages</option>
              {CONTACT_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
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
                : 'Could not load contacts'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No contact messages match these filters."
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
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Contact message"
        panelClassName="max-w-xl"
      >
        {detailQuery.isLoading ? (
          <div className="space-y-3" aria-label="Loading contact message">
            <AdminSkeleton className="h-5 w-2/3" />
            <AdminSkeleton className="h-20 w-full" />
          </div>
        ) : detailQuery.isError ? (
          <AdminInlineError
            message={
              detailQuery.error instanceof ApiError
                ? getApiErrorMessage(detailQuery.error)
                : 'Could not load this message'
            }
            onRetry={() => void detailQuery.refetch()}
          />
        ) : detailQuery.data ? (
          <article className="space-y-5 text-left font-body text-sm text-saan-charcoal">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{detailQuery.data.name}</p>
                <a className="underline-offset-2 hover:underline" href={`mailto:${detailQuery.data.email}`}>
                  {detailQuery.data.email}
                </a>
                <p>{detailQuery.data.phone}</p>
              </div>
              <StatusBadge status={detailQuery.data.status} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/50">
                {detailQuery.data.subject}
              </p>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{detailQuery.data.message}</p>
            </div>
            <time className="block text-xs text-saan-ink/50" dateTime={detailQuery.data.createdAt}>
              Received {formatAdminDate(detailQuery.data.createdAt)}
            </time>
          </article>
        ) : null}
      </ModalShell>

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete contact"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70">
            Delete the message from{' '}
            <span className="font-medium text-saan-charcoal">
              {pendingDelete?.name ?? 'this contact'}
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
