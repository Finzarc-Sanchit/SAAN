'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { SizeFormModal } from '@/components/admin/sizes/SizeFormModal';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import {
  createSize,
  deleteSize,
  listSizes,
  sizesQueryKeys,
  updateSize,
} from '@/lib/api/sizes';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import type { GarmentSize, SizeFormValues } from '@/lib/types/size';
import { ModalShell } from '@/components/ui/ModalShell';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; size: GarmentSize };

export function SizesPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<GarmentSize | null>(null);

  const listQuery = useQuery({
    queryKey: sizesQueryKeys.list(),
    queryFn: listSizes,
  });

  const createMutation = useMutation({
    mutationFn: createSize,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sizesQueryKeys.all });
      toast('Size created');
      setModal({ open: false });
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not create size',
        'error',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: SizeFormValues }) =>
      updateSize(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sizesQueryKeys.all });
      toast('Size updated');
      setModal({ open: false });
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not update size',
        'error',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSize(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sizesQueryKeys.all });
      toast('Size deleted');
      setPendingDelete(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not delete size',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<GarmentSize>[]>(
    () => [
      {
        id: 'label',
        header: 'Label',
        cell: (row) => <span className="font-medium tracking-wide">{row.label}</span>,
      },
      {
        id: 'sizeId',
        header: 'Size ID',
        cell: (row) => (
          <code className="rounded bg-saan-bone px-1.5 py-0.5 font-mono text-xs text-saan-ink/70 dark:bg-white/5 dark:text-saan-bone/70">
            {row.sizeId}
          </code>
        ),
      },
      {
        id: 'sortOrder',
        header: 'Sort',
        cell: (row) => row.sortOrder,
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
              onClick={() => setModal({ open: true, mode: 'edit', size: row })}
              aria-label={`Edit ${row.label}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
              Edit
            </AdminButton>
            <AdminButton
              variant="danger"
              className="px-2 py-1.5"
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete ${row.label}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Delete
            </AdminButton>
          </div>
        ),
      },
    ],
    [],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-saan-bone/45">
            Catalog
          </p>
          <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-saan-bone md:text-3xl">
            Sizes
          </h1>
        </div>
        <AdminButton onClick={() => setModal({ open: true, mode: 'create' })}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Size
        </AdminButton>
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
                : 'Could not load sizes'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No sizes yet. Add catalog sizes (S, M, L…) before assigning them to products."
        />
      </AdminCard>

      <SizeFormModal
        isOpen={modal.open}
        mode={modal.open ? modal.mode : 'create'}
        initial={modal.open && modal.mode === 'edit' ? modal.size : null}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) setModal({ open: false });
        }}
        onSubmit={async (values) => {
          if (!modal.open) return;
          if (modal.mode === 'create') {
            await createMutation.mutateAsync(values);
            return;
          }
          await updateMutation.mutateAsync({ id: modal.size.id, values });
        }}
      />

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete size"
        panelClassName="dark:bg-[#161916]"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70 dark:text-saan-bone/70">
            Delete size{' '}
            <span className="font-medium text-saan-charcoal dark:text-saan-bone">
              {pendingDelete?.label}
            </span>
            ? This cannot be undone. Sizes in use by products cannot be deleted.
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
                if (pendingDelete) {
                  void deleteMutation.mutateAsync(pendingDelete.id);
                }
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
