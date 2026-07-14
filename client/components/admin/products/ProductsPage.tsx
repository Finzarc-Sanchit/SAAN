'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Pencil, Plus, SlidersHorizontal } from 'lucide-react';
import { AdjustStockModal } from '@/components/admin/products/AdjustStockModal';
import { ProductStatusBadge } from '@/components/admin/products/ProductStatusBadge';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { AdminPagination } from '@/components/admin/ui/AdminPagination';
import { AdminProductThumb } from '@/components/admin/ui/AdminProductThumb';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { adminInputClassName } from '@/components/admin/ui/AdminFormField';
import { ModalShell } from '@/components/ui/ModalShell';
import { categoriesQueryKeys, listCategories } from '@/lib/api/categories';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import {
  adjustProductStock,
  archiveProduct,
  listProducts,
  productsQueryKeys,
} from '@/lib/api/products';
import { formatInr } from '@/lib/admin/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Product, ProductStatus } from '@/lib/types/product';

const PAGE_LIMIT = 20;

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [stockTarget, setStockTarget] = useState<Product | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_LIMIT,
      categoryId: categoryId || undefined,
      status: status || undefined,
      search: debouncedSearch.trim() || undefined,
      sort: 'newest' as const,
    }),
    [page, categoryId, status, debouncedSearch],
  );

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
  });

  const listQuery = useQuery({
    queryKey: productsQueryKeys.list(listParams),
    queryFn: () => listProducts(listParams),
  });

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      toast('Product archived');
      setArchiveTarget(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not archive product',
        'error',
      );
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({
      productId,
      sizeId,
      quantityDelta,
    }: {
      productId: string;
      sizeId: string;
      quantityDelta: number;
    }) => adjustProductStock(productId, sizeId, quantityDelta),
    onSuccess: async (product) => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      toast(
        `Stock updated · total ${product.stock} (${product.sizes
          .map((s) => `${s.size}: ${s.quantity}`)
          .join(', ')})`,
      );
      setStockTarget(product);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not adjust stock',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<Product>[]>(
    () => [
      {
        id: 'image',
        header: 'Image',
        cell: (row) => {
          const sorted = [...row.images].sort((a, b) => a.sortOrder - b.sortOrder);
          return (
            <AdminProductThumb
              src={sorted[0]?.imageUrl}
              alt={row.name}
              className="h-12 w-10 rounded-md"
            />
          );
        },
      },
      {
        id: 'name',
        header: 'Name',
        cell: (row) => <span className="font-medium">{row.name}</span>,
      },
      {
        id: 'category',
        header: 'Category',
        cell: (row) => categoryNameById.get(row.categoryId) ?? '—',
      },
      {
        id: 'basePrice',
        header: 'Price',
        cell: (row) => (
          <span className="tabular-nums">{formatInr(row.basePrice)}</span>
        ),
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: (row) => <span className="tabular-nums">{row.stock}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <ProductStatusBadge status={row.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => (
          <div className="inline-flex flex-wrap items-center justify-end gap-1">
            <Link
              href={`/admin/products/${row.id}/edit`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-body text-sm text-saan-maroon transition-colors hover:bg-saan-maroon/5 dark:text-saan-gold dark:hover:bg-saan-gold/10"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
              Edit
            </Link>
            <AdminButton
              variant="ghost"
              className="px-2 py-1.5"
              onClick={() => setStockTarget(row)}
              aria-label={`Adjust stock for ${row.name}`}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
              Stock
            </AdminButton>
            {row.status !== 'archived' ? (
              <AdminButton
                variant="danger"
                className="px-2 py-1.5"
                onClick={() => setArchiveTarget(row)}
                aria-label={`Archive ${row.name}`}
              >
                <Archive className="h-4 w-4" strokeWidth={1.5} />
                Archive
              </AdminButton>
            ) : null}
          </div>
        ),
      },
    ],
    [categoryNameById],
  );

  const meta = listQuery.data?.meta;
  const items = listQuery.data?.items ?? [];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-saan-bone/45">
            Catalog
          </p>
          <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-saan-bone md:text-3xl">
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-saan-maroon px-4 py-2.5 font-body text-sm font-medium text-saan-bone transition-colors hover:bg-saan-maroon/90 dark:bg-saan-gold dark:text-saan-charcoal dark:hover:bg-saan-gold/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Product
        </Link>
      </div>

      <AdminCard>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-saan-bone/55">
              Search
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products…"
              className={adminInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-saan-bone/55">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="">All categories</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-saan-bone/55">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ProductStatus | '');
                setPage(1);
              }}
              className={adminInputClassName}
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        <AdminDataTable
          columns={columns}
          data={items}
          rowKey={(row) => row.id}
          isLoading={listQuery.isLoading}
          errorMessage={
            listQuery.isError
              ? listQuery.error instanceof ApiError
                ? getApiErrorMessage(listQuery.error)
                : 'Could not load products'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No products match these filters."
        />

        {meta ? (
          <AdminPagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            onPageChange={setPage}
          />
        ) : null}
      </AdminCard>

      <ModalShell
        isOpen={Boolean(archiveTarget)}
        onClose={() => {
          if (!archiveMutation.isPending) setArchiveTarget(null);
        }}
        title="Archive product"
        panelClassName="dark:bg-[#161916]"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70 dark:text-saan-bone/70">
            Archive{' '}
            <span className="font-medium text-saan-charcoal dark:text-saan-bone">
              {archiveTarget?.name}
            </span>
            ? It will no longer appear on the storefront.
          </p>
          <div className="flex justify-end gap-2">
            <AdminButton
              variant="secondary"
              onClick={() => setArchiveTarget(null)}
              disabled={archiveMutation.isPending}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              isLoading={archiveMutation.isPending}
              onClick={() => {
                if (archiveTarget) void archiveMutation.mutateAsync(archiveTarget.id);
              }}
            >
              Archive
            </AdminButton>
          </div>
        </div>
      </ModalShell>

      <AdjustStockModal
        isOpen={Boolean(stockTarget)}
        product={stockTarget}
        isSubmitting={stockMutation.isPending}
        onClose={() => {
          if (!stockMutation.isPending) setStockTarget(null);
        }}
        onAdjust={async (sizeId, quantityDelta) => {
          if (!stockTarget) return;
          await stockMutation.mutateAsync({
            productId: stockTarget.id,
            sizeId,
            quantityDelta,
          });
        }}
      />
    </div>
  );
}
