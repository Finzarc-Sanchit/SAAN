'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { ProductImageUploader } from '@/components/admin/products/ProductImageUploader';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { dateInputToIso, toDateInputValue } from '@/lib/admin/date-range-status';
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
import { cn } from '@/lib/utils';

type CampaignFormPageProps = {
  mode: 'create' | 'edit';
  campaignId?: string;
};

type FormState = {
  tag: string;
  title: string;
  description: string;
  productId: string;
  imageUrl: string;
  imageAlt: string;
  discountPercent: string;
  ctaText: string;
  startDate: string;
  endDate: string;
  priority: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  tag: '',
  title: '',
  description: '',
  productId: '',
  imageUrl: '',
  imageAlt: '',
  discountPercent: '',
  ctaText: '',
  startDate: '',
  endDate: '',
  priority: '0',
  active: true,
};

function campaignToForm(campaign: AdminCampaign): FormState {
  return {
    tag: campaign.tag,
    title: campaign.title,
    description: campaign.description,
    productId: campaign.productId,
    imageUrl: campaign.imageUrl,
    imageAlt: campaign.imageAlt,
    discountPercent:
      campaign.discountPercent !== null && campaign.discountPercent !== undefined
        ? String(campaign.discountPercent)
        : '',
    ctaText: campaign.ctaText,
    startDate: toDateInputValue(campaign.startDate),
    endDate: toDateInputValue(campaign.endDate),
    priority: String(campaign.priority),
    active: campaign.active,
  };
}

function buildPayload(form: FormState): CreateCampaignInput {
  return {
    tag: form.tag.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    productId: form.productId,
    imageUrl: form.imageUrl,
    imageAlt: form.imageAlt.trim(),
    discountPercent: form.discountPercent.trim() === '' ? null : Number(form.discountPercent),
    ctaText: form.ctaText.trim(),
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

    if (!form.imageUrl) {
      setFieldErrors((prev) => ({ ...prev, imageUrl: 'Campaign image is required' }));
      toast('Please upload a campaign image', 'error');
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

  const campaignImages = form.imageUrl ? [{ imageUrl: form.imageUrl, sortOrder: 0 }] : [];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <BackLink />
        <h1 className="mt-2 font-display text-2xl text-saan-charcoal dark:text-saan-bone md:text-3xl">
          {mode === 'create' ? 'Add Campaign' : 'Edit Campaign'}
        </h1>
        <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-saan-bone/45">
          Featured storefront announcement linked to an active product.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6" noValidate>
        <AdminCard title="Campaign details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Tag" htmlFor="campaign-tag" error={fieldErrors.tag}>
              <input
                id="campaign-tag"
                value={form.tag}
                onChange={(e) => patchForm('tag', e.target.value)}
                className={adminInputClassName}
                maxLength={100}
                disabled={isSubmitting}
                required
              />
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

            <AdminFormField
              label="Title"
              htmlFor="campaign-title"
              error={fieldErrors.title}
              className="md:col-span-2"
            >
              <input
                id="campaign-title"
                value={form.title}
                onChange={(e) => patchForm('title', e.target.value)}
                className={adminInputClassName}
                maxLength={200}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Description"
              htmlFor="campaign-description"
              error={fieldErrors.description}
              className="md:col-span-2"
            >
              <textarea
                id="campaign-description"
                value={form.description}
                onChange={(e) => patchForm('description', e.target.value)}
                className={cn(adminInputClassName, 'min-h-[8rem] resize-y')}
                maxLength={2000}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Product"
              htmlFor="campaign-product"
              error={fieldErrors.productId}
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

            <AdminFormField
              label="Discount percent"
              htmlFor="campaign-discount"
              error={fieldErrors.discountPercent}
              hint="Optional"
            >
              <input
                id="campaign-discount"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                value={form.discountPercent}
                onChange={(e) => patchForm('discountPercent', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
              />
            </AdminFormField>

            <AdminFormField label="CTA text" htmlFor="campaign-cta" error={fieldErrors.ctaText}>
              <input
                id="campaign-cta"
                value={form.ctaText}
                onChange={(e) => patchForm('ctaText', e.target.value)}
                className={adminInputClassName}
                maxLength={100}
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

            <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-saan-charcoal dark:text-saan-bone md:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => patchForm('active', e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-saan-champagne/70 accent-saan-maroon dark:border-white/15 dark:accent-saan-gold"
              />
              Active (visible when within schedule and product is active)
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <ProductImageUploader
            title="Campaign image"
            description="JPEG, PNG, or WebP up to 5MB. One hero image for the announcement."
            value={campaignImages}
            onChange={(images) => patchForm('imageUrl', images[0]?.imageUrl ?? '')}
            error={fieldErrors.imageUrl}
            disabled={isSubmitting}
            maxImages={1}
          />
          <div className="mt-4">
            <AdminFormField
              label="Image alt text"
              htmlFor="campaign-image-alt"
              error={fieldErrors.imageAlt}
              hint="Describe the image for accessibility."
            >
              <input
                id="campaign-image-alt"
                value={form.imageAlt}
                onChange={(e) => patchForm('imageAlt', e.target.value)}
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
      className="inline-flex items-center gap-1.5 font-body text-sm text-saan-ink/55 transition-colors hover:text-saan-maroon dark:text-saan-bone/55 dark:hover:text-saan-gold"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Campaigns
    </Link>
  );
}
