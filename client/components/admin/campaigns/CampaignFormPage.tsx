'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { ProductImageUploader } from '@/components/admin/products/ProductImageUploader';
import { CampaignStorefrontPreview } from '@/components/admin/campaigns/CampaignStorefrontPreview';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { dateInputToIso, toDateInputValue } from '@/lib/admin/date-range-status';
import {
  CAMPAIGN_DESKTOP_IMAGE_SPEC,
  CAMPAIGN_MOBILE_IMAGE_SPEC,
  formatCampaignImageDimensionHint,
} from '@/lib/campaign-image-spec';
import {
  campaignsQueryKeys,
  createCampaign,
  getCampaign,
  updateCampaign,
} from '@/lib/api/campaigns';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import { fetchAdminProduct, listProducts, productsQueryKeys } from '@/lib/api/products';
import {
  campaignFormSchema,
  type AdminCampaign,
  type CreateCampaignInput,
} from '@/lib/types/campaign';
import type { Product } from '@/lib/types/product';

type CampaignFormPageProps = {
  mode: 'create' | 'edit';
  campaignId?: string;
};

type FormState = {
  productId: string;
  desktopImageUrl: string;
  desktopImageAlt: string;
  mobileImageUrl: string;
  mobileImageAlt: string;
  startDate: string;
  endDate: string;
  priority: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  productId: '',
  desktopImageUrl: '',
  desktopImageAlt: '',
  mobileImageUrl: '',
  mobileImageAlt: '',
  startDate: '',
  endDate: '',
  priority: '0',
  active: true,
};

function campaignToForm(campaign: AdminCampaign): FormState {
  return {
    productId: campaign.productId,
    desktopImageUrl: campaign.desktopImageUrl,
    desktopImageAlt: campaign.desktopImageAlt,
    mobileImageUrl: campaign.mobileImageUrl,
    mobileImageAlt: campaign.mobileImageAlt,
    startDate: toDateInputValue(campaign.startDate),
    endDate: toDateInputValue(campaign.endDate),
    priority: String(campaign.priority),
    active: campaign.active,
  };
}

function buildPayload(form: FormState): CreateCampaignInput {
  return {
    productId: form.productId,
    desktopImageUrl: form.desktopImageUrl,
    desktopImageAlt: form.desktopImageAlt.trim(),
    mobileImageUrl: form.mobileImageUrl,
    mobileImageAlt: form.mobileImageAlt.trim(),
    startDate: dateInputToIso(form.startDate),
    endDate: dateInputToIso(form.endDate),
    priority: Number(form.priority),
    active: form.active,
  };
}

export function CampaignFormPage({ mode, campaignId }: CampaignFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  const activeProductsQuery = useQuery({
    queryKey: productsQueryKeys.list({ status: 'active', limit: 100, page: 1 }),
    queryFn: () => listProducts({ status: 'active', limit: 100, page: 1 }),
  });

  const detailQuery = useQuery({
    queryKey: campaignsQueryKeys.detail(campaignId ?? ''),
    queryFn: () => getCampaign(campaignId!),
    enabled: mode === 'edit' && Boolean(campaignId),
  });

  const linkedProductId =
    mode === 'edit' ? detailQuery.data?.productId ?? form.productId : form.productId;

  const linkedProductQuery = useQuery({
    queryKey: productsQueryKeys.detail(linkedProductId ?? ''),
    queryFn: () => fetchAdminProduct(linkedProductId!),
    enabled: Boolean(linkedProductId),
  });

  useEffect(() => {
    if (mode !== 'edit' || !detailQuery.data) return;
    if (hydratedId === detailQuery.data.id) return;
    setForm(campaignToForm(detailQuery.data));
    setHydratedId(detailQuery.data.id);
  }, [mode, detailQuery.data, hydratedId]);

  const productOptions = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of activeProductsQuery.data?.items ?? []) {
      map.set(product.id, product);
    }
    if (linkedProductQuery.data) {
      map.set(linkedProductQuery.data.id, linkedProductQuery.data);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeProductsQuery.data?.items, linkedProductQuery.data]);

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.all });
      toast('Campaign created');
      router.push('/admin/campaigns');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setFieldErrors(getFieldErrors(error));
        toast(getApiErrorMessage(error), 'error');
        return;
      }
      toast('Could not create campaign', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: CreateCampaignInput) => updateCampaign(campaignId!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: campaignsQueryKeys.all });
      toast('Campaign updated');
      router.push('/admin/campaigns');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setFieldErrors(getFieldErrors(error));
        toast(getApiErrorMessage(error), 'error');
        return;
      }
      toast('Could not update campaign', 'error');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const pageReady = useMemo(
    () =>
      !activeProductsQuery.isLoading &&
      (mode === 'create' || (!detailQuery.isLoading && hydratedId !== null)),
    [activeProductsQuery.isLoading, mode, detailQuery.isLoading, hydratedId],
  );

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!form.desktopImageUrl) {
      nextErrors.desktopImageUrl = 'Desktop image is required';
    }
    if (!form.mobileImageUrl) {
      nextErrors.mobileImageUrl = 'Mobile image is required';
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...nextErrors }));
      toast('Please upload both desktop and mobile images', 'error');
      return;
    }

    const payload = buildPayload(form);
    const parsed = campaignFormSchema.safeParse(payload);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || '_form';
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      toast(next._form ?? 'Please fix the highlighted fields', 'error');
      return;
    }

    setFieldErrors({});
    if (mode === 'create') {
      await createMutation.mutateAsync(parsed.data);
      return;
    }
    await updateMutation.mutateAsync(parsed.data);
  }

  if (mode === 'edit' && detailQuery.isError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <AdminCard>
          <AdminInlineError
            message={
              detailQuery.error instanceof ApiError
                ? getApiErrorMessage(detailQuery.error)
                : 'Could not load campaign'
            }
            onRetry={() => void detailQuery.refetch()}
          />
        </AdminCard>
      </div>
    );
  }

  if (!pageReady) {
    return (
      <div className="space-y-4">
        <BackLink />
        <AdminCard>
          <div className="space-y-3">
            <AdminSkeleton className="h-6 w-48" />
            <AdminSkeleton className="h-10 w-full" />
            <AdminSkeleton className="h-10 w-full" />
            <AdminSkeleton className="h-32 w-full" />
          </div>
        </AdminCard>
      </div>
    );
  }

  const desktopImages = form.desktopImageUrl
    ? [{ imageUrl: form.desktopImageUrl, sortOrder: 0 }]
    : [];
  const mobileImages = form.mobileImageUrl
    ? [{ imageUrl: form.mobileImageUrl, sortOrder: 0 }]
    : [];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <BackLink />
        <h1 className="mt-2 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          {mode === 'create' ? 'Add Campaign' : 'Edit Campaign'}
        </h1>
        <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-paper/45">
          Image-only storefront banner linked to a product. Upload separate desktop and mobile
          assets — each displays only on its breakpoint.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6" noValidate>
        <AdminCard title="Campaign details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField
              label="Product"
              htmlFor="campaign-product"
              error={fieldErrors.productId}
              hint="Clicking the banner opens this product page."
              className="md:col-span-2"
            >
              <select
                id="campaign-product"
                value={form.productId}
                onChange={(e) => patchForm('productId', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              >
                <option value="">Select active product</option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.status !== 'active' ? ` (${product.status})` : ''}
                  </option>
                ))}
              </select>
            </AdminFormField>

            <AdminFormField label="Priority" htmlFor="campaign-priority" error={fieldErrors.priority}>
              <input
                id="campaign-priority"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.priority}
                onChange={(e) => patchForm('priority', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField label="Start date" htmlFor="campaign-start" error={fieldErrors.startDate}>
              <input
                id="campaign-start"
                type="date"
                value={form.startDate}
                onChange={(e) => patchForm('startDate', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField label="End date" htmlFor="campaign-end" error={fieldErrors.endDate}>
              <input
                id="campaign-end"
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => patchForm('endDate', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-saan-charcoal dark:text-paper md:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => patchForm('active', e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-saan-champagne/70 accent-saan-maroon dark:border-white/15 dark:accent-ink"
              />
              Active (visible when within schedule and product is active)
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <ProductImageUploader
            title="Desktop image"
            description={formatCampaignImageDimensionHint(CAMPAIGN_DESKTOP_IMAGE_SPEC)}
            value={desktopImages}
            onChange={(images) => patchForm('desktopImageUrl', images[0]?.imageUrl ?? '')}
            error={fieldErrors.desktopImageUrl}
            disabled={isSubmitting}
            maxImages={1}
          />
          {form.desktopImageUrl ? (
            <CampaignStorefrontPreview
              imageUrl={form.desktopImageUrl}
              alt={form.desktopImageAlt}
              variant="desktop"
            />
          ) : null}
          <div className="mt-4">
            <AdminFormField
              label="Desktop image alt text"
              htmlFor="campaign-desktop-image-alt"
              error={fieldErrors.desktopImageAlt}
              hint="Shown on screens 768px and wider."
            >
              <input
                id="campaign-desktop-image-alt"
                value={form.desktopImageAlt}
                onChange={(e) => patchForm('desktopImageAlt', e.target.value)}
                className={adminInputClassName}
                maxLength={300}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard>
          <ProductImageUploader
            title="Mobile image"
            description={formatCampaignImageDimensionHint(CAMPAIGN_MOBILE_IMAGE_SPEC)}
            value={mobileImages}
            onChange={(images) => patchForm('mobileImageUrl', images[0]?.imageUrl ?? '')}
            error={fieldErrors.mobileImageUrl}
            disabled={isSubmitting}
            maxImages={1}
          />
          {form.mobileImageUrl ? (
            <CampaignStorefrontPreview
              imageUrl={form.mobileImageUrl}
              alt={form.mobileImageAlt}
              variant="mobile"
            />
          ) : null}
          <div className="mt-4">
            <AdminFormField
              label="Mobile image alt text"
              htmlFor="campaign-mobile-image-alt"
              error={fieldErrors.mobileImageAlt}
              hint="Shown below 768px. Same banner layout as desktop — only the image asset changes."
            >
              <input
                id="campaign-mobile-image-alt"
                value={form.mobileImageAlt}
                onChange={(e) => patchForm('mobileImageAlt', e.target.value)}
                className={adminInputClassName}
                maxLength={300}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>
          </div>
        </AdminCard>

        <div className="flex justify-end gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => router.push('/admin/campaigns')}
          >
            Cancel
          </AdminButton>
          <AdminButton type="submit" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create campaign' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/campaigns"
      className="inline-flex items-center gap-1.5 font-body text-sm text-saan-ink/55 transition-colors hover:text-ink dark:text-paper/55 dark:hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Campaigns
    </Link>
  );
}
