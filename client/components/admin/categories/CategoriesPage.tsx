'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus } from 'lucide-react';
import { CategoryFormModal } from '@/components/admin/categories/CategoryFormModal';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import {
  categoriesQueryKeys,
  createCategory,
  listCategories,
  updateCategory,
} from '@/lib/api/categories';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import type { Category } from '@/lib/types/category';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; category: Category };

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [modal, setModal] = useState<ModalState>({ open: false });

  const listQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
      toast('Category created');
      setModal({ open: false });
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not create category',
        'error',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, { name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKeys.all });
      toast('Category updated');
      setModal({ open: false });
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not update category',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<Category>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'products',
        header: 'Products',
        cell: (row) => (
          <span className="tabular-nums text-saan-ink/70 dark:text-saan-bone/70">
            {row.productCount}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => (
          <AdminButton
            variant="ghost"
            className="px-2 py-1.5"
            onClick={() => setModal({ open: true, mode: 'edit', category: row })}
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.5} />
            Edit
          </AdminButton>
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
            Categories
          </h1>
        </div>
        <AdminButton onClick={() => setModal({ open: true, mode: 'create' })}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Category
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
                : 'Could not load categories'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No categories yet. Add one to start organizing the catalog."
        />
      </AdminCard>

      <CategoryFormModal
        isOpen={modal.open}
        mode={modal.open ? modal.mode : 'create'}
        initial={modal.open && modal.mode === 'edit' ? modal.category : null}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) setModal({ open: false });
        }}
        onSubmit={async ({ name }) => {
          if (!modal.open) return;
          if (modal.mode === 'create') {
            await createMutation.mutateAsync({ name });
            return;
          }
          await updateMutation.mutateAsync({ id: modal.category.id, name });
        }}
      />
    </div>
  );
}
