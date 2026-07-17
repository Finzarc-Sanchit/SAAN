'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  collectionsQueryKeys,
  createCollection,
  getCollection,
  updateCollection,
} from '@/lib/api/collections';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import {
  collectionFormSchema,
  type Collection,
  type CollectionFormValues,
} from '@/lib/types/collection';
import { cn } from '@/lib/utils';

type CollectionFormPageProps = {
  mode: 'create' | 'edit';
  collectionId?: string;
};

type FormState = Omit<CollectionFormValues, 'sortOrder'> & {
  sortOrder: string;
};

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  tagline: '',
  imageUrl: '',
  imageAlt: '',
  status: 'draft',
  sortOrder: '0',
  featured: false,
};

function collectionToForm(collection: Collection): FormState {
  return {
    title: collection.title,
    description: collection.description,
    tagline: collection.tagline,
    imageUrl: collection.imageUrl,
    imageAlt: collection.imageAlt,
    status: collection.status,
    sortOrder: String(collection.sortOrder),
    featured: collection.featured,
  };
}

function buildFormValues(form: FormState): CollectionFormValues {
  return {
    title: form.title,
    description: form.description,
    tagline: form.tagline,
    imageUrl: form.imageUrl,
    imageAlt: form.imageAlt,
    status: form.status,
    sortOrder: Number(form.sortOrder),
    featured: form.featured,
  };
}

export function CollectionFormPage({
  mode,
  collectionId,
}: CollectionFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: collectionsQueryKeys.detail(collectionId ?? ''),
    queryFn: () => getCollection(collectionId!),
    enabled: mode === 'edit' && Boolean(collectionId),
  });

  useEffect(() => {
    if (mode !== 'edit' || !detailQuery.data || hydratedId === detailQuery.data.id) return;
    setForm(collectionToForm(detailQuery.data));
    setHydratedId(detailQuery.data.id);
  }, [detailQuery.data, hydratedId, mode]);

  function focusFirstError() {
    requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    });
  }

  function applyApiError(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
      setFieldErrors(getFieldErrors(error));
      toast(getApiErrorMessage(error), 'error');
      focusFirstError();
      return;
    }
    toast(fallback, 'error');
  }

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all });
      toast('Collection created');
      router.push('/admin/collections');
    },
    onError: (error: unknown) => applyApiError(error, 'Could not create collection'),
  });

  const updateMutation = useMutation({
    mutationFn: (input: CollectionFormValues) => updateCollection(collectionId!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.all });
      toast('Collection updated');
      router.push('/admin/collections');
    },
    onError: (error: unknown) => applyApiError(error, 'Could not update collection'),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const pageReady = mode === 'create' || (!detailQuery.isLoading && hydratedId !== null);
  const uploadedImages = useMemo(
    () => (form.imageUrl ? [{ imageUrl: form.imageUrl, sortOrder: 0 }] : []),
    [form.imageUrl],
  );

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function handleTitleChange(title: string) {
    setForm((previous) => ({ ...previous, title }));
    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next.title;
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = collectionFormSchema.safeParse(buildFormValues(form));

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || '_form';
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      toast(nextErrors._form ?? 'Please fix the highlighted fields', 'error');
      focusFirstError();
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
                : 'Could not load collection'
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

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <BackLink />
        <h1 className="mt-2 font-display text-2xl text-saan-charcoal dark:text-paper md:text-3xl">
          {mode === 'create' ? 'Add Collection' : 'Edit Collection'}
        </h1>
        <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-paper/45">
          Curate the collection identity, placement, and publication state.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4 lg:space-y-6"
        noValidate
      >
        <AdminCard title="Collection details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField
              label="Title"
              htmlFor="collection-title"
              error={fieldErrors.title}
              className="md:col-span-2"
            >
              <input
                id="collection-title"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                className={adminInputClassName}
                maxLength={160}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? 'collection-title-error' : undefined}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Tagline"
              htmlFor="collection-tagline"
              error={fieldErrors.tagline}
              className="md:col-span-2"
            >
              <input
                id="collection-tagline"
                value={form.tagline}
                onChange={(event) => patchForm('tagline', event.target.value)}
                className={adminInputClassName}
                maxLength={240}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.tagline)}
                aria-describedby={fieldErrors.tagline ? 'collection-tagline-error' : undefined}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Description"
              htmlFor="collection-description"
              error={fieldErrors.description}
              className="md:col-span-2"
            >
              <textarea
                id="collection-description"
                value={form.description}
                onChange={(event) => patchForm('description', event.target.value)}
                className={cn(adminInputClassName, 'min-h-32 resize-y')}
                maxLength={2_000}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={
                  fieldErrors.description ? 'collection-description-error' : undefined
                }
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Status"
              htmlFor="collection-status"
              error={fieldErrors.status}
            >
              <select
                id="collection-status"
                value={form.status}
                onChange={(event) =>
                  patchForm('status', event.target.value as FormState['status'])
                }
                className={adminInputClassName}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.status)}
                aria-describedby={fieldErrors.status ? 'collection-status-error' : undefined}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </AdminFormField>

            <AdminFormField
              label="Sort order"
              htmlFor="collection-sort-order"
              error={fieldErrors.sortOrder}
              hint="Lower numbers appear first."
            >
              <input
                id="collection-sort-order"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={form.sortOrder}
                onChange={(event) => patchForm('sortOrder', event.target.value)}
                className={adminInputClassName}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.sortOrder)}
                aria-describedby={
                  fieldErrors.sortOrder
                    ? 'collection-sort-order-error'
                    : 'collection-sort-order-hint'
                }
                required
              />
            </AdminFormField>

            <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-saan-charcoal dark:text-paper md:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => patchForm('featured', event.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-saan-champagne/70 accent-saan-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 dark:border-white/15 dark:accent-ink dark:focus-visible:ring-ink/30"
              />
              Feature this collection
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <ProductImageUploader
            title="Collection image"
            description="JPEG, PNG, or WebP up to 5MB. One image required."
            value={uploadedImages}
            onChange={(images) => patchForm('imageUrl', images[0]?.imageUrl ?? '')}
            error={fieldErrors.imageUrl}
            disabled={isSubmitting}
            maxImages={1}
          />
          <div className="mt-4">
            <AdminFormField
              label="Image alt text"
              htmlFor="collection-image-alt"
              error={fieldErrors.imageAlt}
            >
              <input
                id="collection-image-alt"
                value={form.imageAlt}
                onChange={(event) => patchForm('imageAlt', event.target.value)}
                className={adminInputClassName}
                maxLength={300}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.imageAlt)}
                aria-describedby={
                  fieldErrors.imageAlt ? 'collection-image-alt-error' : undefined
                }
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
            onClick={() => router.push('/admin/collections')}
          >
            Cancel
          </AdminButton>
          <AdminButton type="submit" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create collection' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/collections"
      className="inline-flex items-center gap-1.5 font-body text-sm text-saan-ink/55 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 dark:text-paper/55 dark:hover:text-ink dark:focus-visible:ring-ink/30"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      Collections
    </Link>
  );
}
