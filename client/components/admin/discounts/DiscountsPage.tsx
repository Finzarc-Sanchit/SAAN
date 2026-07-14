'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DiscountFormModal } from '@/components/admin/discounts/DiscountFormModal';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { DateRangeStatusBadge } from '@/components/admin/ui/DateRangeStatusBadge';
import { DiscountTypeBadge } from '@/components/admin/ui/DiscountTypeBadge';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import {
  formatAdminDate,
  getDateRangeStatus,
} from '@/lib/admin/date-range-status';
import {
  createDiscount,
  deleteDiscount,
  discountsQueryKeys,
  formatDiscountValue,
  listDiscounts,
  updateDiscount,
} from '@/lib/api/discounts';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { listProducts, productsQueryKeys } from '@/lib/api/products';
import type { Discount, DiscountFormValues } from '@/lib/types/discount';
import { ModalShell } from '@/components/ui/ModalShell';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; discount: Discount };

function toApiPayload(values: DiscountFormValues) {
  return {
    type: values.type,
    value: values.value,
    validFrom: values.validFrom,
    validTo: values.validTo,
  };
}

export function DiscountsPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<Discount | null>(null);

  const listQuery = useQuery({
    queryKey: discountsQueryKeys.list(),
    queryFn: listDiscounts,
  });

  const productsQuery = useQuery({
    queryKey: productsQueryKeys.list({ limit: 100, page: 1 }),
    queryFn: () => listProducts({ limit: 100, page: 1 }),
  });

  const productUsageByDiscountId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of productsQuery.data?.items ?? []) {
      if (!product.discountId) continue;
      counts.set(product.discountId, (counts.get(product.discountId) ?? 0) + 1);
    }
    return counts;
  }, [productsQuery.data?.items]);

  const createMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountsQueryKeys.all });
      toast('Discount created');
      setModal({ open: false });
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not create discount',
        'error',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: DiscountFormValues }) =>
      updateDiscount(id, toApiPayload(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountsQueryKeys.all });
      toast('Discount updated');
      setModal({ open: false });
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not update discount',
        'error',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDiscount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: discountsQueryKeys.all });
      toast('Discount deleted');
      setPendingDelete(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not delete discount',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<Discount>[]>(
    () => [
      {
        id: 'type',
        header: 'Type',
        cell: (row) => <DiscountTypeBadge type={row.type} />,
      },
      {
        id: 'value',
        header: 'Value',
        cell: (row) => (
          <span className="font-medium tabular-nums">{formatDiscountValue(row)}</span>
        ),
      },
      {
        id: 'validFrom',
        header: 'Valid from',
        cell: (row) => formatAdminDate(row.validFrom),
      },
      {
        id: 'validTo',
        header: 'Valid to',
        cell: (row) => formatAdminDate(row.validTo),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => (
          <DateRangeStatusBadge status={getDateRangeStatus(row.validFrom, row.validTo)} />
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
              onClick={() => setModal({ open: true, mode: 'edit', discount: row })}
              aria-label={`Edit ${formatDiscountValue(row)} discount`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
              Edit
            </AdminButton>
            <AdminButton
              variant="danger"
              className="px-2 py-1.5"
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete ${formatDiscountValue(row)} discount`}
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
  const productsUsingCount = pendingDelete
    ? (productUsageByDiscountId.get(pendingDelete.id) ?? 0)
    : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-saan-bone/45">
            Promotions
          </p>
          <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-saan-bone md:text-3xl">
            Discounts
          </h1>
        </div>
        <AdminButton onClick={() => setModal({ open: true, mode: 'create' })}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Discount
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
                : 'Could not load discounts'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No discounts yet. Create one to apply to products."
        />
      </AdminCard>

      <DiscountFormModal
        isOpen={modal.open}
        mode={modal.open ? modal.mode : 'create'}
        initial={modal.open && modal.mode === 'edit' ? modal.discount : null}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) setModal({ open: false });
        }}
        onSubmit={async (values) => {
          if (!modal.open) return;
          if (modal.mode === 'create') {
            await createMutation.mutateAsync(toApiPayload(values));
            return;
          }
          await updateMutation.mutateAsync({ id: modal.discount.id, values });
        }}
      />

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete discount"
        panelClassName="dark:bg-[#161916]"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70 dark:text-saan-bone/70">
            Delete this{' '}
            <span className="font-medium text-saan-charcoal dark:text-saan-bone">
              {pendingDelete ? formatDiscountValue(pendingDelete) : ''}
            </span>{' '}
            discount? This cannot be undone.
          </p>
          {productsUsingCount > 0 ? (
            <p className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 font-body text-sm text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
              {productsUsingCount} product{productsUsingCount === 1 ? '' : 's'} currently use
              this discount. Removing it will leave those products without a linked discount.
            </p>
          ) : null}
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
