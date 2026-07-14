'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, X } from 'lucide-react';
import { ProductImageUploader } from '@/components/admin/products/ProductImageUploader';
import { ProductSizesEditor } from '@/components/admin/products/ProductSizesEditor';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import {
  formStateFromDraft,
  readStoredProductFormDraft,
  useProductFormDraft,
} from '@/hooks/useProductFormDraft';
import { formatDraftSavedAt } from '@/lib/admin/product-form-draft';
import { formatDiscountLabel, discountsQueryKeys, listDiscounts } from '@/lib/api/discounts';
import { categoriesQueryKeys, listCategories } from '@/lib/api/categories';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import {
  createProduct,
  fetchAdminProduct,
  productsQueryKeys,
  updateProduct,
} from '@/lib/api/products';
import { listSizes, sizesQueryKeys } from '@/lib/api/sizes';
import {
  productFormSchema,
  type CreateProductInput,
  type Product,
  type ProductFormValues,
  type ProductImageInput,
  type ProductSizeInput,
  type ProductStatus,
} from '@/lib/types/product';
import { cn } from '@/lib/utils';

type ProductFormPageProps = {
  mode: 'create' | 'edit';
  productId?: string;
};

type FormState = {
  categoryId: string;
  discountId: string;
  name: string;
  description: string;
  shortDescription: string;
  fabric: string;
  basePrice: string;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  sizes: ProductSizeInput[];
  images: ProductImageInput[];
};

const EMPTY_FORM: FormState = {
  categoryId: '',
  discountId: '',
  name: '',
  description: '',
  shortDescription: '',
  fabric: '',
  basePrice: '',
  status: 'draft',
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  sizes: [{ sizeId: '', quantity: 0 }],
  images: [],
};

function productToForm(product: Product): FormState {
  return {
    categoryId: product.categoryId,
    discountId: product.discountId ?? '',
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    fabric: product.fabric,
    basePrice: String(product.basePrice),
    status: product.status,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    sizes: product.sizes.map((size) => ({
      sizeId: size.sizeId,
      quantity: size.quantity,
    })),
    images: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image, index) => ({
        imageUrl: image.imageUrl,
        sortOrder: index,
      })),
  };
}

function buildPayload(form: FormState): CreateProductInput {
  return {
    categoryId: form.categoryId,
    discountId: form.discountId ? form.discountId : null,
    name: form.name.trim(),
    description: form.description.trim(),
    shortDescription: form.shortDescription.trim(),
    fabric: form.fabric.trim(),
    basePrice: Number(form.basePrice),
    status: form.status,
    isFeatured: form.isFeatured,
    isNewArrival: form.isNewArrival,
    isBestSeller: form.isBestSeller,
    sizes: form.sizes.map((row) => ({
      sizeId: row.sizeId,
      quantity: row.quantity,
    })),
    images: form.images.map((image, index) => ({
      imageUrl: image.imageUrl,
      sortOrder: index,
    })),
  };
}

export function ProductFormPage({ mode, productId }: ProductFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();

  const hadDraftOnMount = useRef(false);
  const [draftChecked, setDraftChecked] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  useEffect(() => {
    const draft = readStoredProductFormDraft(mode, productId);
    hadDraftOnMount.current = draft !== null;
    if (draft) {
      setForm(formStateFromDraft(draft));
      setDraftSavedAt(draft.savedAt);
      setShowDraftBanner(true);
    }
    setDraftChecked(true);
  }, [mode, productId]);

  const categoriesQuery = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
  });
  const discountsQuery = useQuery({
    queryKey: discountsQueryKeys.list(),
    queryFn: listDiscounts,
  });
  const sizesQuery = useQuery({
    queryKey: sizesQueryKeys.list(),
    queryFn: listSizes,
  });

  const detailQuery = useQuery({
    queryKey: productsQueryKeys.detail(productId ?? ''),
    queryFn: () => fetchAdminProduct(productId!),
    enabled: mode === 'edit' && Boolean(productId),
  });

  useEffect(() => {
    if (!draftChecked) return;
    if (mode !== 'edit' || !detailQuery.data) return;
    if (hydratedId === detailQuery.data.id) return;
    if (!hadDraftOnMount.current) {
      setForm(productToForm(detailQuery.data));
    }
    setHydratedId(detailQuery.data.id);
  }, [draftChecked, mode, detailQuery.data, hydratedId]);

  const draftPersistenceReady =
    draftChecked && (mode === 'create' || hadDraftOnMount.current || hydratedId !== null);

  const { clearDraft } = useProductFormDraft({
    mode,
    productId,
    form,
    enabled: draftPersistenceReady,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      clearDraft();
      await queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      toast('Product created');
      router.push('/admin/products');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setFieldErrors(getFieldErrors(error));
        toast(getApiErrorMessage(error), 'error');
        return;
      }
      toast('Could not create product', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: CreateProductInput) => updateProduct(productId!, input),
    onSuccess: async () => {
      clearDraft();
      await queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      toast('Product updated');
      router.push('/admin/products');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setFieldErrors(getFieldErrors(error));
        toast(getApiErrorMessage(error), 'error');
        return;
      }
      toast('Could not update product', 'error');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const catalogReady = useMemo(
    () =>
      draftChecked &&
      !categoriesQuery.isLoading &&
      !discountsQuery.isLoading &&
      !sizesQuery.isLoading &&
      (mode === 'create' || !detailQuery.isLoading),
    [
      draftChecked,
      categoriesQuery.isLoading,
      discountsQuery.isLoading,
      sizesQuery.isLoading,
      mode,
      detailQuery.isLoading,
    ],
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
    const payload = buildPayload(form);
    const parsed = productFormSchema.safeParse(payload);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || '_form';
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      toast(next._form ?? next.sizes ?? next.images ?? 'Please fix the highlighted fields', 'error');
      return;
    }

    setFieldErrors({});
    const values = parsed.data as ProductFormValues;
    const body: CreateProductInput = {
      ...values,
      discountId: values.discountId ? values.discountId : null,
    };

    if (mode === 'create') {
      await createMutation.mutateAsync(body);
      return;
    }
    await updateMutation.mutateAsync(body);
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
                : 'Could not load product'
            }
            onRetry={() => void detailQuery.refetch()}
          />
        </AdminCard>
      </div>
    );
  }

  if (!catalogReady) {
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <BackLink />
          <h1 className="mt-2 font-display text-2xl text-saan-charcoal dark:text-saan-bone md:text-3xl">
            {mode === 'create' ? 'Add Product' : 'Edit Product'}
          </h1>
          {mode === 'edit' && detailQuery.data ? (
            <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-saan-bone/45">
              Slug assigned by server: {detailQuery.data.slug}
            </p>
          ) : (
            <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-saan-bone/45">
              Slug is generated from the name on save.
            </p>
          )}
        </div>
      </div>

      {showDraftBanner ? (
        <div
          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-saan-champagne/60 bg-saan-bone/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
          role="status"
        >
          <p className="font-body text-sm text-saan-ink/70 dark:text-saan-bone/70">
            {draftSavedAt
              ? `Unsaved work restored from this session (saved ${formatDraftSavedAt(draftSavedAt)}).`
              : 'Unsaved work restored from this session.'}
          </p>
          <div className="flex items-center gap-2">
            <AdminButton
              type="button"
              variant="ghost"
              className="px-2 py-1 text-xs"
              onClick={() => {
                clearDraft();
                setShowDraftBanner(false);
                if (mode === 'edit' && detailQuery.data) {
                  setForm(productToForm(detailQuery.data));
                } else {
                  setForm(EMPTY_FORM);
                }
                toast('Draft discarded');
              }}
            >
              Discard draft
            </AdminButton>
            <button
              type="button"
              onClick={() => setShowDraftBanner(false)}
              className="rounded-md p-1 text-saan-ink/50 hover:text-saan-charcoal dark:text-saan-bone/50 dark:hover:text-saan-bone"
              aria-label="Dismiss draft notice"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6" noValidate>
        <AdminCard title="Basic info">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField
              label="Name"
              htmlFor="product-name"
              error={fieldErrors.name}
              className="md:col-span-2"
            >
              <input
                id="product-name"
                value={form.name}
                onChange={(e) => patchForm('name', e.target.value)}
                className={adminInputClassName}
                maxLength={200}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField label="Category" htmlFor="product-category" error={fieldErrors.categoryId}>
              <select
                id="product-category"
                value={form.categoryId}
                onChange={(e) => patchForm('categoryId', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              >
                <option value="">Select category</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </AdminFormField>

            <AdminFormField
              label="Discount"
              htmlFor="product-discount"
              error={fieldErrors.discountId}
              hint="Optional"
            >
              <select
                id="product-discount"
                value={form.discountId}
                onChange={(e) => patchForm('discountId', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
              >
                <option value="">No discount</option>
                {(discountsQuery.data ?? []).map((discount) => (
                  <option key={discount.id} value={discount.id}>
                    {formatDiscountLabel(discount)}
                  </option>
                ))}
              </select>
            </AdminFormField>

            <AdminFormField label="Fabric" htmlFor="product-fabric" error={fieldErrors.fabric}>
              <input
                id="product-fabric"
                value={form.fabric}
                onChange={(e) => patchForm('fabric', e.target.value)}
                className={adminInputClassName}
                maxLength={200}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Base price (INR)"
              htmlFor="product-price"
              error={fieldErrors.basePrice}
            >
              <input
                id="product-price"
                type="number"
                min={0.01}
                step="0.01"
                value={form.basePrice}
                onChange={(e) => patchForm('basePrice', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Short description"
              htmlFor="product-short"
              error={fieldErrors.shortDescription}
              className="md:col-span-2"
            >
              <textarea
                id="product-short"
                value={form.shortDescription}
                onChange={(e) => patchForm('shortDescription', e.target.value)}
                className={cn(adminInputClassName, 'min-h-[5rem] resize-y')}
                maxLength={500}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Description"
              htmlFor="product-description"
              error={fieldErrors.description}
              className="md:col-span-2"
            >
              <textarea
                id="product-description"
                value={form.description}
                onChange={(e) => patchForm('description', e.target.value)}
                className={cn(adminInputClassName, 'min-h-[8rem] resize-y')}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField label="Status" htmlFor="product-status" error={fieldErrors.status}>
              <select
                id="product-status"
                value={form.status}
                onChange={(e) => patchForm('status', e.target.value as ProductStatus)}
                className={adminInputClassName}
                disabled={isSubmitting}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </AdminFormField>

            <fieldset className="space-y-2 md:col-span-2">
              <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-saan-bone/55">
                Flags
              </legend>
              <div className="flex flex-wrap gap-4">
                {(
                  [
                    ['isFeatured', 'Featured'],
                    ['isNewArrival', 'New arrival'],
                    ['isBestSeller', 'Best seller'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="inline-flex items-center gap-2 font-body text-sm text-saan-charcoal dark:text-saan-bone"
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => patchForm(key, e.target.checked)}
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded border-saan-champagne text-saan-maroon focus:ring-saan-maroon/30"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </AdminCard>

        <AdminCard>
          <ProductSizesEditor
            catalogSizes={sizesQuery.data ?? []}
            value={form.sizes}
            onChange={(sizes) => patchForm('sizes', sizes)}
            error={fieldErrors.sizes ?? fieldErrors['sizes.0.sizeId']}
            disabled={isSubmitting}
          />
        </AdminCard>

        <AdminCard>
          <ProductImageUploader
            value={form.images}
            onChange={(images) => patchForm('images', images)}
            error={fieldErrors.images}
            disabled={isSubmitting}
          />
        </AdminCard>

        <div className="flex justify-end gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => router.push('/admin/products')}
          >
            Cancel
          </AdminButton>
          <AdminButton type="submit" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/products"
      className="inline-flex items-center gap-1.5 font-body text-sm text-saan-ink/55 transition-colors hover:text-saan-maroon dark:text-saan-bone/55 dark:hover:text-saan-gold"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Products
    </Link>
  );
}
