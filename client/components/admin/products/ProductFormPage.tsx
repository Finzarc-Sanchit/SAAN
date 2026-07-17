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
import {
  dateTimeLocalInputToIso,
  toDateTimeLocalInputValue,
} from '@/lib/admin/date-range-status';
import { formatDraftSavedAt } from '@/lib/admin/product-form-draft';
import { categoriesQueryKeys, listCategories } from '@/lib/api/categories';
import { collectionsQueryKeys, listCollections } from '@/lib/api/collections';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import {
  createProduct,
  fetchAdminProduct,
  productsQueryKeys,
  updateProduct,
} from '@/lib/api/products';
import { listSizes, sizesQueryKeys } from '@/lib/api/sizes';
import {
  DEFAULT_PRODUCT_CARE,
  formatCareTextarea,
  parseCareTextarea,
  productFormSchema,
  type CreateProductInput,
  type Product,
  type ProductFormValues,
  type ProductImageInput,
  type ProductOccasion,
  type ProductSizeInput,
  type ProductStatus,
} from '@/lib/types/product';
import { PRODUCT_OCCASIONS } from '@/lib/product-occasion';
import {
  computeDiscountPercentFromSalePrice,
  computeSalePriceFromDiscountPercent,
} from '@/lib/product-pricing';
import { cn } from '@/lib/utils';

type ProductFormPageProps = {
  mode: 'create' | 'edit';
  productId?: string;
};

type FormState = {
  categoryId: string;
  collectionId: string;
  name: string;
  description: string;
  shortDescription: string;
  fabric: string;
  color: string;
  occasion: ProductOccasion[];
  fitNotes: string;
  careText: string;
  basePrice: string;
  discountEnabled: boolean;
  discountPercent: string;
  salePrice: string;
  discountStartDate: string;
  discountEndDate: string;
  status: ProductStatus;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  sizes: ProductSizeInput[];
  images: ProductImageInput[];
};

const EMPTY_FORM: FormState = {
  categoryId: '',
  collectionId: '',
  name: '',
  description: '',
  shortDescription: '',
  fabric: '',
  color: '',
  occasion: [],
  fitNotes: '',
  careText: formatCareTextarea([...DEFAULT_PRODUCT_CARE]),
  basePrice: '',
  discountEnabled: false,
  discountPercent: '',
  salePrice: '',
  discountStartDate: '',
  discountEndDate: '',
  status: 'draft',
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  sizes: [{ sizeId: '', quantity: 0 }],
  images: [],
};

function normalizeOccasion(value: Product['occasion'] | undefined): ProductOccasion[] {
  if (Array.isArray(value) && value.length > 0) return value;
  if (typeof value === 'string' && value) return [value as ProductOccasion];
  return [];
}

function productToForm(product: Product): FormState {
  const salePrice =
    product.salePrice != null ? String(product.salePrice) : '';
  const discountPercent =
    product.discountPercent != null
      ? String(product.discountPercent)
      : product.salePrice != null
      ? String(computeDiscountPercentFromSalePrice(product.basePrice, product.salePrice))
      : '';

  return {
    categoryId: product.categoryId,
    collectionId: product.collectionId ?? '',
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    fabric: product.fabric,
    color: product.color ?? '',
    occasion: normalizeOccasion(product.occasion),
    fitNotes: product.fitNotes ?? '',
    careText: formatCareTextarea(
      product.care?.length ? product.care : [...DEFAULT_PRODUCT_CARE],
    ),
    basePrice: String(product.basePrice),
    discountEnabled: product.discountEnabled,
    discountPercent,
    salePrice,
    discountStartDate: toDateTimeLocalInputValue(product.discountStartDate),
    discountEndDate: toDateTimeLocalInputValue(product.discountEndDate),
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

function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
}

function buildPayload(form: FormState): CreateProductInput {
  const salePrice = form.discountEnabled ? parsePositiveInt(form.salePrice) : null;
  const discountPercent = form.discountEnabled
    ? parsePositiveInt(form.discountPercent)
    : null;

  return {
    categoryId: form.categoryId,
    collectionId: form.collectionId,
    name: form.name.trim(),
    description: form.description.trim(),
    shortDescription: form.shortDescription.trim(),
    fabric: form.fabric.trim(),
    color: form.color.trim(),
    occasion: form.occasion,
    fitNotes: form.fitNotes.trim(),
    care: parseCareTextarea(form.careText),
    basePrice: Number(form.basePrice),
    salePrice,
    discountPercent,
    discountEnabled: form.discountEnabled,
    discountStartDate:
      form.discountEnabled && form.discountStartDate
        ? dateTimeLocalInputToIso(form.discountStartDate)
        : null,
    discountEndDate:
      form.discountEnabled && form.discountEndDate
        ? dateTimeLocalInputToIso(form.discountEndDate)
        : null,
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
  const collectionsQuery = useQuery({
    queryKey: collectionsQueryKeys.list(),
    queryFn: listCollections,
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all }),
      ]);
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all }),
      ]);
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
      !collectionsQuery.isLoading &&
      !sizesQuery.isLoading &&
      (mode === 'create' || !detailQuery.isLoading),
    [
      draftChecked,
      categoriesQuery.isLoading,
      collectionsQuery.isLoading,
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
      if (key === 'careText') delete next.care;
      return next;
    });
  }

  function toggleOccasion(value: ProductOccasion) {
    setForm((prev) => {
      const selected = prev.occasion.includes(value)
        ? prev.occasion.filter((item) => item !== value)
        : [...prev.occasion, value];
      return { ...prev, occasion: selected };
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.occasion;
      return next;
    });
  }

  function handleBasePriceChange(value: string) {
    setForm((prev) => {
      const next = { ...prev, basePrice: value };
      const base = parsePositiveInt(value);
      const discount = parsePositiveInt(prev.discountPercent);
      const sale = parsePositiveInt(prev.salePrice);

      if (base && discount) {
        next.salePrice = String(computeSalePriceFromDiscountPercent(base, discount));
      } else if (base && sale) {
        next.discountPercent = String(computeDiscountPercentFromSalePrice(base, sale));
      }

      return next;
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.basePrice;
      delete next.salePrice;
      delete next.discountPercent;
      return next;
    });
  }

  function handleDiscountPercentChange(value: string) {
    setForm((prev) => {
      const next = { ...prev, discountPercent: value };
      const base = parsePositiveInt(prev.basePrice);
      const discount = parsePositiveInt(value);

      if (base && discount) {
        next.salePrice = String(computeSalePriceFromDiscountPercent(base, discount));
      } else if (!value.trim()) {
        next.salePrice = '';
      }

      return next;
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.discountPercent;
      delete next.salePrice;
      return next;
    });
  }

  function handleSalePriceChange(value: string) {
    setForm((prev) => {
      const next = { ...prev, salePrice: value };
      const base = parsePositiveInt(prev.basePrice);
      const sale = parsePositiveInt(value);

      if (base && sale) {
        next.discountPercent = String(computeDiscountPercentFromSalePrice(base, sale));
      } else if (!value.trim()) {
        next.discountPercent = '';
      }

      return next;
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.salePrice;
      delete next.discountPercent;
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
      salePrice: values.salePrice ?? null,
      discountPercent: values.discountPercent ?? null,
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
          <h1 className="mt-2 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
            {mode === 'create' ? 'Add Product' : 'Edit Product'}
          </h1>
          {mode === 'edit' && detailQuery.data ? (
            <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-paper/45">
              Slug assigned by server: {detailQuery.data.slug}
            </p>
          ) : (
            <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-paper/45">
              Slug is generated from the name on save.
            </p>
          )}
        </div>
      </div>

      {showDraftBanner ? (
        <div
          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-saan-champagne/60 bg-paper/80 px-4 py-3 dark:border-white/10 dark:bg-white/5"
          role="status"
        >
          <p className="font-body text-sm text-saan-ink/70 dark:text-paper/70">
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
              className="rounded-md p-1 text-saan-ink/50 hover:text-saan-charcoal dark:text-paper/50 dark:hover:text-paper"
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
              label="Collection"
              htmlFor="product-collection"
              error={fieldErrors.collectionId}
            >
              <select
                id="product-collection"
                value={form.collectionId}
                onChange={(e) => patchForm('collectionId', e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              >
                <option value="">Select collection</option>
                {(collectionsQuery.data ?? []).map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title}
                    {collection.status === 'draft' ? ' (draft)' : ''}
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

            <AdminFormField label="Colour" htmlFor="product-color" error={fieldErrors.color}>
              <input
                id="product-color"
                value={form.color}
                onChange={(e) => patchForm('color', e.target.value)}
                className={adminInputClassName}
                maxLength={100}
                placeholder="e.g. Midnight Blue"
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Occasion"
              htmlFor="product-occasion"
              error={fieldErrors.occasion}
              className="md:col-span-2"
            >
              <div
                id="product-occasion"
                role="group"
                aria-label="Product occasions"
                className="flex flex-wrap gap-3"
              >
                {PRODUCT_OCCASIONS.map((occasion) => {
                  const checked = form.occasion.includes(occasion);
                  return (
                    <label
                      key={occasion}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-body text-sm transition-colors',
                        checked
                          ? 'border-saan-maroon/40 bg-saan-maroon/5 text-saan-charcoal dark:border-ink/40 dark:bg-ink/10 dark:text-paper'
                          : 'border-saan-champagne/60 text-saan-ink/70 dark:border-white/10 dark:text-paper/70',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOccasion(occasion)}
                        disabled={isSubmitting}
                        className="size-4 accent-saan-maroon dark:accent-ink"
                      />
                      {occasion}
                    </label>
                  );
                })}
              </div>
            </AdminFormField>

            <AdminFormField
              label="Base price (INR)"
              htmlFor="product-price"
              error={fieldErrors.basePrice}
            >
              <input
                id="product-price"
                type="number"
                min={1}
                step={1}
                value={form.basePrice}
                onChange={(e) => handleBasePriceChange(e.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-saan-champagne/60 bg-paper/45 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
                  Product discount
                </p>
                <p className="mt-1 font-body text-xs text-saan-ink/50 dark:text-paper/50">
                  Schedule a temporary reduced price.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.discountEnabled}
                aria-label="Enable product discount"
                onClick={() => patchForm('discountEnabled', !form.discountEnabled)}
                disabled={isSubmitting}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  form.discountEnabled
                    ? 'bg-saan-maroon'
                    : 'bg-saan-ink/20 dark:bg-paper/20',
                )}
              >
                <span
                  className={cn(
                    'absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                    form.discountEnabled && 'translate-x-5',
                  )}
                />
              </button>
            </div>

            {form.discountEnabled ? (
              <div className="grid gap-4 border-l border-saan-maroon/20 pl-4 md:col-span-2 md:grid-cols-2">
                <AdminFormField
                  label="Discount (%)"
                  htmlFor="product-discount-percent"
                  error={fieldErrors.discountPercent}
                  hint="Updates sale price automatically"
                >
                  <input
                    id="product-discount-percent"
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    value={form.discountPercent}
                    onChange={(e) => handleDiscountPercentChange(e.target.value)}
                    className={adminInputClassName}
                    disabled={isSubmitting}
                    placeholder="e.g. 20"
                    required
                  />
                </AdminFormField>

                <AdminFormField
                  label="Sale price (INR)"
                  htmlFor="product-sale-price"
                  error={fieldErrors.salePrice}
                  hint="Updates discount % automatically"
                >
                  <input
                    id="product-sale-price"
                    type="number"
                    min={1}
                    step={1}
                    value={form.salePrice}
                    onChange={(e) => handleSalePriceChange(e.target.value)}
                    className={adminInputClassName}
                    disabled={isSubmitting}
                    placeholder="Discounted price"
                    required
                  />
                </AdminFormField>

                <AdminFormField
                  label="Starts at"
                  htmlFor="product-discount-start"
                  error={fieldErrors.discountStartDate}
                >
                  <input
                    id="product-discount-start"
                    type="datetime-local"
                    value={form.discountStartDate}
                    onChange={(e) => patchForm('discountStartDate', e.target.value)}
                    className={adminInputClassName}
                    disabled={isSubmitting}
                    required
                  />
                </AdminFormField>

                <AdminFormField
                  label="Ends at"
                  htmlFor="product-discount-end"
                  error={fieldErrors.discountEndDate}
                >
                  <input
                    id="product-discount-end"
                    type="datetime-local"
                    min={form.discountStartDate || undefined}
                    value={form.discountEndDate}
                    onChange={(e) => patchForm('discountEndDate', e.target.value)}
                    className={adminInputClassName}
                    disabled={isSubmitting}
                    required
                  />
                </AdminFormField>
              </div>
            ) : null}

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

            <AdminFormField
              label="Comfort & fit"
              htmlFor="product-fit-notes"
              error={fieldErrors.fitNotes}
              hint="Shown in the Comfort & Fit accordion on the product page"
              className="md:col-span-2"
            >
              <textarea
                id="product-fit-notes"
                value={form.fitNotes}
                onChange={(e) => patchForm('fitNotes', e.target.value)}
                className={cn(adminInputClassName, 'min-h-[5rem] resize-y')}
                maxLength={2000}
                placeholder="e.g. Model is 5 ft 6 in wearing S. Fit relaxed."
                disabled={isSubmitting}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Materials & care"
              htmlFor="product-care"
              error={fieldErrors.care}
              hint="One care instruction per line. Fabric is shown above these lines on the product page."
              className="md:col-span-2"
            >
              <textarea
                id="product-care"
                value={form.careText}
                onChange={(e) => patchForm('careText', e.target.value)}
                className={cn(adminInputClassName, 'min-h-[7rem] resize-y')}
                placeholder={'Dry Clean Only\nDo not Wash\nIron at low temperature'}
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
              <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-saan-ink/55 dark:text-paper/55">
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
                    className="inline-flex items-center gap-2 font-body text-sm text-saan-charcoal dark:text-paper"
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => patchForm(key, e.target.checked)}
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded border-saan-champagne text-ink focus:ring-saan-maroon/30"
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
      className="inline-flex items-center gap-1.5 font-body text-sm text-saan-ink/55 transition-colors hover:text-ink dark:text-paper/55 dark:hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Products
    </Link>
  );
}
