'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { CampaignStatusBadge } from '@/components/admin/campaigns/CampaignStatusBadge';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import {
  AdminDataTable,
  type AdminTableColumn,
} from '@/components/admin/ui/AdminDataTable';
import { AdminProductCell } from '@/components/admin/ui/AdminProductCell';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { formatAdminDate } from '@/lib/admin/date-range-status';
import {
  campaignsQueryKeys,
  deleteCampaign,
  listCampaigns,
} from '@/lib/api/campaigns';
import { categoriesQueryKeys, listCategories } from '@/lib/api/categories';
import { ApiError, getApiErrorMessage } from '@/lib/api/errors';
import { fetchAdminProduct, productsQueryKeys } from '@/lib/api/products';
import type { AdminCampaign } from '@/lib/types/campaign';
import type { Product } from '@/lib/types/product';
import { ModalShell } from '@/components/ui/ModalShell';

function getPrimaryProductImage(product: Product): string | null {
  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted[0]?.imageUrl ?? null;
}

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const [pendingDelete, setPendingDelete] = useState<AdminCampaign | null>(null);

  const listQuery = useQuery({
    queryKey: campaignsQueryKeys.list(),
    queryFn: listCampaigns,
  });

  const campaignProductIds = useMemo(
    () => [...new Set((listQuery.data ?? []).map((campaign) => campaign.productId))],
    [listQuery.data],
  );

  const campaignProductQueries = useQueries({
    queries: campaignProductIds.map((id) => ({
      queryKey: productsQueryKeys.detail(id),
      queryFn: () => fetchAdminProduct(id),
      enabled: listQuery.isSuccess && Boolean(id),
      staleTime: 60_000,
    })),
  });

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
  });

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const query of campaignProductQueries) {
      if (query.data) {
        map.set(query.data.id, query.data);
      }
    }
    return map;
  }, [campaignProductQueries]);

  const productQueryById = useMemo(() => {
    const map = new Map<string, (typeof campaignProductQueries)[number]>();
    campaignProductIds.forEach((id, index) => {
      map.set(id, campaignProductQueries[index]);
    });
    return map;
  }, [campaignProductIds, campaignProductQueries]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categoriesQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.all });
      toast('Campaign deleted');
      setPendingDelete(null);
    },
    onError: (error: unknown) => {
      toast(
        error instanceof ApiError ? getApiErrorMessage(error) : 'Could not delete campaign',
        'error',
      );
    },
  });

  const columns = useMemo<AdminTableColumn<AdminCampaign>[]>(
    () => [
      {
        id: 'desktop',
        header: 'Desktop',
        cell: (row) =>
          row.desktopImageUrl ? (
            <img
              src={row.desktopImageUrl}
              alt=""
              className="h-12 w-20 rounded-md object-cover"
            />
          ) : (
            <span className="text-saan-ink/40 dark:text-paper/40">—</span>
          ),
      },
      {
        id: 'product',
        header: 'Product',
        cell: (row) => {
          const productQuery = productQueryById.get(row.productId);
          if (productQuery?.isLoading) {
            return (
              <span className="font-body text-sm text-saan-ink/45 dark:text-paper/45">
                Loading…
              </span>
            );
          }

          const product = productById.get(row.productId);
          if (!product) {
            return (
              <AdminProductCell
                imageUrl={null}
                name="Unknown product"
                subtitle="—"
              />
            );
          }

          return (
            <AdminProductCell
              imageUrl={getPrimaryProductImage(product)}
              name={product.name}
              subtitle={categoryNameById.get(product.categoryId) ?? '—'}
            />
          );
        },
      },
      {
        id: 'schedule',
        header: 'Schedule',
        cell: (row) => (
          <span className="text-sm text-saan-ink/70 dark:text-paper/70">
            {formatAdminDate(row.startDate)} – {formatAdminDate(row.endDate)}
          </span>
        ),
      },
      {
        id: 'priority',
        header: 'Priority',
        cell: (row) => <span className="tabular-nums">{row.priority}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <CampaignStatusBadge campaign={row} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => {
          const productName = productById.get(row.productId)?.name ?? 'product';

          return (
          <div className="inline-flex items-center justify-end gap-1">
            <Link
              href={`/admin/campaigns/${row.id}/edit`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-body text-sm text-ink transition-colors hover:bg-saan-maroon/5 dark:text-ink dark:hover:bg-ink/10"
              aria-label={`Edit campaign for ${productName}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
              Edit
            </Link>
            <AdminButton
              variant="danger"
              className="px-2 py-1.5"
              onClick={() => setPendingDelete(row)}
              aria-label={`Delete campaign for ${productName}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Delete
            </AdminButton>
          </div>
          );
        },
      },
    ],
    [categoryNameById, productById, productQueryById],
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saan-ink/45 dark:text-paper/45">
            Promotions
          </p>
          <h1 className="mt-1 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
            Campaigns
          </h1>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-saan-maroon px-4 py-2.5 font-body text-sm font-medium text-paper transition-colors hover:bg-saan-maroon/90 dark:bg-ink dark:text-saan-charcoal dark:hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Campaign
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
                : 'Could not load campaigns'
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
          emptyMessage="No campaigns yet. Create one to feature on the storefront."
        />
      </AdminCard>

      <ModalShell
        isOpen={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
        title="Delete campaign"
        panelClassName="dark:bg-[#161916]"
      >
        <div className="space-y-5 text-left">
          <p className="font-body text-sm text-saan-ink/70 dark:text-paper/70">
            Delete this campaign for{' '}
            <span className="font-medium text-saan-charcoal dark:text-paper">
              {productById.get(pendingDelete?.productId ?? '')?.name ?? 'this product'}
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
