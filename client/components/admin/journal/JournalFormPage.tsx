'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { ProductImageUploader } from '@/components/admin/products/ProductImageUploader';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminCard, AdminInlineError, AdminSkeleton } from '@/components/admin/ui/AdminCard';
import {
  AdminFormField,
  adminInputClassName,
} from '@/components/admin/ui/AdminFormField';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import {
  createJournal,
  getAdminJournal,
  journalQueryKeys,
  updateJournal,
} from '@/lib/api/journal';
import { ApiError, getApiErrorMessage, getFieldErrors } from '@/lib/api/errors';
import {
  JOURNAL_BLOCK_TYPES,
  JOURNAL_CATEGORIES,
  JOURNAL_STATUSES,
  journalFormSchema,
  type Journal,
  type JournalContentBlock,
  type JournalFormValues,
} from '@/lib/types/journal';
import { cn } from '@/lib/utils';

type JournalFormPageProps = {
  mode: 'create' | 'edit';
  journalId?: string;
};

type FormState = JournalFormValues;

const EMPTY_BLOCK: JournalContentBlock = {
  type: 'paragraph',
  value: '',
};

const EMPTY_FORM: FormState = {
  title: '',
  excerpt: '',
  category: 'Style Guide',
  imageUrl: '',
  imageAlt: '',
  blocks: [{ ...EMPTY_BLOCK }],
  status: 'draft',
  featured: false,
};

function journalToForm(journal: Journal): FormState {
  return {
    title: journal.title,
    excerpt: journal.excerpt,
    category: journal.category,
    imageUrl: journal.imageUrl,
    imageAlt: journal.imageAlt,
    blocks: journal.blocks.length > 0 ? journal.blocks : [{ ...EMPTY_BLOCK }],
    status: journal.status,
    featured: journal.featured,
  };
}

function sanitizeBlocks(blocks: JournalContentBlock[]): JournalContentBlock[] {
  return blocks.map((block) => {
    if (block.type === 'image') {
      return {
        type: 'image',
        src: block.src?.trim() || undefined,
        alt: block.alt?.trim() || undefined,
        caption: block.caption?.trim() || undefined,
      };
    }
    if (block.type === 'heading') {
      return {
        type: 'heading',
        value: block.value?.trim() || undefined,
        level: block.level === 3 ? 3 : 2,
      };
    }
    return {
      type: block.type,
      value: block.value?.trim() || undefined,
    };
  });
}

export function JournalFormPage({ mode, journalId }: JournalFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useAdminToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: journalQueryKeys.detail(journalId ?? ''),
    queryFn: () => getAdminJournal(journalId!),
    enabled: mode === 'edit' && Boolean(journalId),
  });

  useEffect(() => {
    if (mode !== 'edit' || !detailQuery.data || hydratedId === detailQuery.data.id) return;
    setForm(journalToForm(detailQuery.data));
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
    mutationFn: createJournal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: journalQueryKeys.all });
      toast('Journal article created');
      router.push('/admin/journal');
    },
    onError: (error: unknown) => applyApiError(error, 'Could not create journal article'),
  });

  const updateMutation = useMutation({
    mutationFn: (input: JournalFormValues) => updateJournal(journalId!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: journalQueryKeys.all });
      toast('Journal article updated');
      router.push('/admin/journal');
    },
    onError: (error: unknown) => applyApiError(error, 'Could not update journal article'),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const pageReady = mode === 'create' || (!detailQuery.isLoading && hydratedId !== null);
  const uploadedImages = useMemo(
    () => (form.imageUrl ? [{ imageUrl: form.imageUrl, sortOrder: 0 }] : []),
    [form.imageUrl],
  );

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => {
      const next = { ...previous, [key]: value };
      if (key === 'status' && value !== 'published') {
        next.featured = false;
      }
      return next;
    });
    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[key as string];
      return next;
    });
  }

  function patchBlock(index: number, patch: Partial<JournalContentBlock>) {
    setForm((previous) => ({
      ...previous,
      blocks: previous.blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    }));
    setFieldErrors((previous) => {
      const next = { ...previous };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`blocks.${index}`)) delete next[key];
      });
      return next;
    });
  }

  function addBlock() {
    setForm((previous) => ({
      ...previous,
      blocks: [...previous.blocks, { ...EMPTY_BLOCK }],
    }));
  }

  function removeBlock(index: number) {
    setForm((previous) => ({
      ...previous,
      blocks:
        previous.blocks.length <= 1
          ? [{ ...EMPTY_BLOCK }]
          : previous.blocks.filter((_, blockIndex) => blockIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: JournalFormValues = {
      ...form,
      featured: form.status === 'published' ? form.featured : false,
      blocks: sanitizeBlocks(form.blocks),
    };
    const parsed = journalFormSchema.safeParse(payload);

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
                : 'Could not load journal article'
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
          {mode === 'create' ? 'Add journal article' : 'Edit journal article'}
        </h1>
        <p className="mt-1 font-body text-xs text-saan-ink/45 dark:text-paper/45">
          Write editorial stories with a cover image and structured content blocks.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4 lg:space-y-6"
        noValidate
      >
        <AdminCard title="Article details">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField
              label="Title"
              htmlFor="journal-title"
              error={fieldErrors.title}
              className="md:col-span-2"
            >
              <input
                id="journal-title"
                value={form.title}
                onChange={(event) => patchForm('title', event.target.value)}
                className={adminInputClassName}
                maxLength={200}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.title)}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Excerpt"
              htmlFor="journal-excerpt"
              error={fieldErrors.excerpt}
              className="md:col-span-2"
            >
              <textarea
                id="journal-excerpt"
                value={form.excerpt}
                onChange={(event) => patchForm('excerpt', event.target.value)}
                className={cn(adminInputClassName, 'min-h-28 resize-y')}
                maxLength={1_200}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.excerpt)}
                required
              />
            </AdminFormField>

            <AdminFormField
              label="Category"
              htmlFor="journal-category"
              error={fieldErrors.category}
            >
              <select
                id="journal-category"
                value={form.category}
                onChange={(event) =>
                  patchForm('category', event.target.value as FormState['category'])
                }
                className={adminInputClassName}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.category)}
              >
                {JOURNAL_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </AdminFormField>

            <AdminFormField
              label="Status"
              htmlFor="journal-status"
              error={fieldErrors.status}
            >
              <select
                id="journal-status"
                value={form.status}
                onChange={(event) =>
                  patchForm('status', event.target.value as FormState['status'])
                }
                className={adminInputClassName}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.status)}
              >
                {JOURNAL_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </AdminFormField>

            <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-saan-charcoal dark:text-paper md:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => patchForm('featured', event.target.checked)}
                disabled={isSubmitting || form.status !== 'published'}
                className="h-4 w-4 rounded border-saan-champagne/70 accent-saan-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 dark:border-white/15 dark:accent-ink dark:focus-visible:ring-ink/30"
              />
              Feature this article
              {form.status !== 'published' ? (
                <span className="text-xs text-saan-ink/45 dark:text-paper/45">
                  (publish first)
                </span>
              ) : null}
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <ProductImageUploader
            title="Cover image"
            description="JPEG, PNG, or WebP up to 5MB. One image required."
            value={uploadedImages}
            onChange={(images) => patchForm('imageUrl', images[0]?.imageUrl ?? '')}
            error={fieldErrors.imageUrl}
            disabled={isSubmitting}
            maxImages={1}
          />
          <div className="mt-4">
            <AdminFormField
              label="Cover image alt text"
              htmlFor="journal-image-alt"
              error={fieldErrors.imageAlt}
            >
              <input
                id="journal-image-alt"
                value={form.imageAlt}
                onChange={(event) => patchForm('imageAlt', event.target.value)}
                className={adminInputClassName}
                maxLength={300}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.imageAlt)}
                required
              />
            </AdminFormField>
          </div>
        </AdminCard>

        <AdminCard title="Content blocks">
          <div className="space-y-4">
            {form.blocks.map((block, index) => (
              <div
                key={`block-${index}`}
                className="rounded-lg border border-saan-champagne/50 p-4 dark:border-white/10"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <AdminFormField
                    label={`Block ${index + 1} type`}
                    htmlFor={`journal-block-type-${index}`}
                    className="min-w-[12rem] flex-1"
                  >
                    <select
                      id={`journal-block-type-${index}`}
                      value={block.type}
                      onChange={(event) => {
                        const type = event.target.value as JournalContentBlock['type'];
                        if (type === 'image') {
                          patchBlock(index, {
                            type,
                            value: undefined,
                            level: undefined,
                            src: '',
                            alt: '',
                            caption: '',
                          });
                          return;
                        }
                        if (type === 'heading') {
                          patchBlock(index, {
                            type,
                            value: block.value ?? '',
                            level: 2,
                            src: undefined,
                            alt: undefined,
                            caption: undefined,
                          });
                          return;
                        }
                        patchBlock(index, {
                          type,
                          value: block.value ?? '',
                          level: undefined,
                          src: undefined,
                          alt: undefined,
                          caption: undefined,
                        });
                      }}
                      className={adminInputClassName}
                      disabled={isSubmitting}
                    >
                      {JOURNAL_BLOCK_TYPES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </AdminFormField>
                  <AdminButton
                    type="button"
                    variant="danger"
                    className="px-2 py-1.5"
                    onClick={() => removeBlock(index)}
                    disabled={isSubmitting}
                    aria-label={`Remove block ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    Remove
                  </AdminButton>
                </div>

                {block.type === 'image' ? (
                  <div className="space-y-3">
                    <ProductImageUploader
                      title="Block image"
                      description="Upload one image for this block."
                      value={
                        block.src
                          ? [{ imageUrl: block.src, sortOrder: 0 }]
                          : []
                      }
                      onChange={(images) =>
                        patchBlock(index, { src: images[0]?.imageUrl ?? '' })
                      }
                      error={fieldErrors[`blocks.${index}.src`]}
                      disabled={isSubmitting}
                      maxImages={1}
                    />
                    <AdminFormField
                      label="Alt text"
                      htmlFor={`journal-block-alt-${index}`}
                      error={fieldErrors[`blocks.${index}.alt`]}
                    >
                      <input
                        id={`journal-block-alt-${index}`}
                        value={block.alt ?? ''}
                        onChange={(event) => patchBlock(index, { alt: event.target.value })}
                        className={adminInputClassName}
                        maxLength={300}
                        disabled={isSubmitting}
                      />
                    </AdminFormField>
                    <AdminFormField
                      label="Caption"
                      htmlFor={`journal-block-caption-${index}`}
                      error={fieldErrors[`blocks.${index}.caption`]}
                    >
                      <input
                        id={`journal-block-caption-${index}`}
                        value={block.caption ?? ''}
                        onChange={(event) =>
                          patchBlock(index, { caption: event.target.value })
                        }
                        className={adminInputClassName}
                        maxLength={500}
                        disabled={isSubmitting}
                      />
                    </AdminFormField>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {block.type === 'heading' ? (
                      <AdminFormField
                        label="Heading level"
                        htmlFor={`journal-block-level-${index}`}
                      >
                        <select
                          id={`journal-block-level-${index}`}
                          value={block.level ?? 2}
                          onChange={(event) =>
                            patchBlock(index, {
                              level: Number(event.target.value) === 3 ? 3 : 2,
                            })
                          }
                          className={adminInputClassName}
                          disabled={isSubmitting}
                        >
                          <option value={2}>H2</option>
                          <option value={3}>H3</option>
                        </select>
                      </AdminFormField>
                    ) : null}
                    <AdminFormField
                      label="Content"
                      htmlFor={`journal-block-value-${index}`}
                      error={fieldErrors[`blocks.${index}.value`]}
                    >
                      <textarea
                        id={`journal-block-value-${index}`}
                        value={block.value ?? ''}
                        onChange={(event) =>
                          patchBlock(index, { value: event.target.value })
                        }
                        className={cn(adminInputClassName, 'min-h-28 resize-y')}
                        disabled={isSubmitting}
                        aria-invalid={Boolean(fieldErrors[`blocks.${index}.value`])}
                      />
                    </AdminFormField>
                  </div>
                )}
              </div>
            ))}

            <AdminButton type="button" variant="secondary" onClick={addBlock} disabled={isSubmitting}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Add block
            </AdminButton>
          </div>
        </AdminCard>

        <div className="flex justify-end gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => router.push('/admin/journal')}
          >
            Cancel
          </AdminButton>
          <AdminButton type="submit" isLoading={isSubmitting}>
            {mode === 'create' ? 'Create article' : 'Save changes'}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/journal"
      className="inline-flex items-center gap-1.5 font-body text-sm text-saan-ink/55 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saan-maroon/30 dark:text-paper/55 dark:hover:text-ink dark:focus-visible:ring-ink/30"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      Journal
    </Link>
  );
}
