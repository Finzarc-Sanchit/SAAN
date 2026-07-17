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
import { AdminProductThumb } from '@/components/admin/ui/AdminProductThumb';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { ModalShell } from '@/components/ui/ModalShell';
import { formatAdminDate } from '@/lib/admin/date-range-status';
import {
  collectionsQueryKeys,
  deleteCollection,
  listCollections,
} from '@/lib/api/collections';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import type { Collection, CollectionStatus } from '@/lib/types/collection';
import { cn } from '@/lib/utils';

function CollectionStatusBadge({ status }: { status: CollectionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]',
        status === 'published'
          ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
          : 'bg-saan-champagne/45 text-saan-ink/65 dark:bg-white/10 dark:text-paper/65',
      )}
    >
      {status}
    </span>
  );
}

export function CollectionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [pendingDelete, setPendingDelete] = useState<Collection | null>(null);

  const listQuery = useQuery({
    queryKey: collectionsQueryKeys.list(),
    queryFn: listCollections,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all });
      toast('Collection deleted');
      setPendingDelete(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not delete collection',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<Collection>[]>(
    () => [
      {
        id: 'image',
        header: 'Image',
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
        header: 'Collection',
        cell: (row) => (
          <div className="min-w-40">
            <p className="font-medium">{row.title}</p>
            <p className="mt-0.5 text-xs text-saan-ink/45 dark:text-paper/45">
              {row.slug}
            </p>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <CollectionStatusBadge status={row.status} />,
      },
      {
        id: 'products',
        header: 'Products',
        cell: (row) => (
          <span className="tabular-nums text-saan-ink/70 dark:text-paper/70">
            {row.productCount}
          </span>
        ),
      },
      {
        id: 'featured',
        header: 'Featured',
        cell: (row) =>
          row.featured ? (
            <span className="inline-flex items-center gap-1 text-sm text-saan-charcoal dark:text-paper">
              <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
              Yes
            </span>
          ) : (
            <span className="text-saan-ink/45 dark:text-paper/45">No</span>
          ),
      },
      {
        id: 'sortOrder',
        header: 'Order',
        cell: (row) => <span className="tabular-nums">{row.sortOrder}</span>,
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
              href={`/admin/collections/${row.id}/edit`}
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
            Catalogue
          </p>
          <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
            Collections
          </h1>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-saan-maroon px-4 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-saan-maroon/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 focus-visible:ring-offset-2 dark:bg-ink dark:text-saan-charcoal dark:hover:bg-ink/90 dark:focus-visible:ring-ink/30"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Add Collection
        </Link>
      </div>

      <AdminCard>
        <AdminDataTable
          columns={columns}
          data={listQuery.data ?? []}
          rowKey={(row) => row.id}
          isLoading={listQuery.isLoading}
          errorMessage={
            listQuery.isError
              ? listQuery.error instanceof ApiError
                ? getApiErrorMessage(listQuery.error)
                : 'Could not load collections'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No collections yet. Create one to organise the catalogue."
        />
      </AdminCard>

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete collection"
        panelClassName="dark:bg-[#161916]"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70 dark:text-paper/70">
            Delete{' '}
            <span className="font-medium text-saan-charcoal dark:text-paper">
              {pendingDelete?.title ?? 'this collection'}
            </span>
            ? This cannot be undone.
            {pendingDelete && pendingDelete.productCount > 0
              ? ` Remove it from ${pendingDelete.productCount} ${
                  pendingDelete.productCount === 1 ? 'product' : 'products'
                } before deleting.`
              : ''}
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
              disabled={Boolean(pendingDelete?.productCount)}
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
