import type { ProductImageInput, ProductSizeInput, ProductStatus } from '@/lib/types/product';

export type ProductFormDraft = {
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
  savedAt: string;
};

const DRAFT_PREFIX = 'saan-admin-product-draft';

function draftStorageKey(mode: 'create' | 'edit', productId?: string): string {
  if (mode === 'create') return `${DRAFT_PREFIX}:new`;
  return `${DRAFT_PREFIX}:edit:${productId ?? 'unknown'}`;
}

export function hasProductFormDraftContent(draft: Omit<ProductFormDraft, 'savedAt'>): boolean {
  return (
    draft.name.trim().length > 0 ||
    draft.description.trim().length > 0 ||
    draft.shortDescription.trim().length > 0 ||
    draft.fabric.trim().length > 0 ||
    draft.basePrice.trim().length > 0 ||
    draft.categoryId.length > 0 ||
    draft.discountId.length > 0 ||
    draft.images.length > 0 ||
    draft.sizes.some((row) => row.sizeId.length > 0 || row.quantity > 0) ||
    draft.isFeatured ||
    draft.isNewArrival ||
    draft.isBestSeller ||
    draft.status !== 'draft'
  );
}

export function readProductFormDraft(
  mode: 'create' | 'edit',
  productId?: string,
): ProductFormDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(draftStorageKey(mode, productId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ProductFormDraft;
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      categoryId: parsed.categoryId ?? '',
      discountId: parsed.discountId ?? '',
      name: parsed.name ?? '',
      description: parsed.description ?? '',
      shortDescription: parsed.shortDescription ?? '',
      fabric: parsed.fabric ?? '',
      basePrice: parsed.basePrice ?? '',
      status: parsed.status ?? 'draft',
      isFeatured: Boolean(parsed.isFeatured),
      isNewArrival: Boolean(parsed.isNewArrival),
      isBestSeller: Boolean(parsed.isBestSeller),
      sizes: Array.isArray(parsed.sizes) && parsed.sizes.length > 0
        ? parsed.sizes
        : [{ sizeId: '', quantity: 0 }],
      images: Array.isArray(parsed.images) ? parsed.images : [],
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeProductFormDraft(
  mode: 'create' | 'edit',
  productId: string | undefined,
  draft: Omit<ProductFormDraft, 'savedAt'>,
): void {
  if (typeof window === 'undefined') return;
  if (!hasProductFormDraftContent(draft)) {
    clearProductFormDraft(mode, productId);
    return;
  }

  const payload: ProductFormDraft = {
    ...draft,
    savedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(draftStorageKey(mode, productId), JSON.stringify(payload));
}

export function clearProductFormDraft(mode: 'create' | 'edit', productId?: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(draftStorageKey(mode, productId));
}

export function formatDraftSavedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}
