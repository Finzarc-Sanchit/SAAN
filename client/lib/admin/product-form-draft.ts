import type {
  ProductImageInput,
  ProductOccasion,
  ProductSizeInput,
  ProductStatus,
} from '@/lib/types/product';
import { DEFAULT_PRODUCT_CARE, formatCareTextarea } from '@/lib/types/product';

export type ProductFormDraft = {
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
  savedAt: string;
};

const DRAFT_PREFIX = 'saan-admin-product-draft';

function draftStorageKey(mode: 'create' | 'edit', productId?: string): string {
  if (mode === 'create') return `${DRAFT_PREFIX}:new`;
  return `${DRAFT_PREFIX}:edit:${productId ?? 'unknown'}`;
}

function normalizeDraftOccasion(value: unknown): ProductOccasion[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is ProductOccasion => typeof item === 'string');
  }
  if (typeof value === 'string' && value) {
    return [value as ProductOccasion];
  }
  return [];
}

export function hasProductFormDraftContent(draft: Omit<ProductFormDraft, 'savedAt'>): boolean {
  return (
    draft.name.trim().length > 0 ||
    draft.description.trim().length > 0 ||
    draft.shortDescription.trim().length > 0 ||
    draft.fabric.trim().length > 0 ||
    draft.color.trim().length > 0 ||
    draft.occasion.length > 0 ||
    draft.fitNotes.trim().length > 0 ||
    draft.careText.trim().length > 0 ||
    draft.basePrice.trim().length > 0 ||
    draft.discountEnabled ||
    draft.discountPercent.trim().length > 0 ||
    draft.salePrice.trim().length > 0 ||
    draft.discountStartDate.trim().length > 0 ||
    draft.discountEndDate.trim().length > 0 ||
    draft.categoryId.length > 0 ||
    draft.collectionId.length > 0 ||
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

    const parsed = JSON.parse(raw) as ProductFormDraft & { care?: string[] };
    if (!parsed || typeof parsed !== 'object') return null;

    const careText =
      typeof parsed.careText === 'string'
        ? parsed.careText
        : Array.isArray(parsed.care)
          ? formatCareTextarea(parsed.care)
          : formatCareTextarea([...DEFAULT_PRODUCT_CARE]);

    return {
      categoryId: parsed.categoryId ?? '',
      collectionId: typeof parsed.collectionId === 'string' ? parsed.collectionId : '',
      name: parsed.name ?? '',
      description: parsed.description ?? '',
      shortDescription: parsed.shortDescription ?? '',
      fabric: parsed.fabric ?? '',
      color: parsed.color ?? '',
      occasion: normalizeDraftOccasion(parsed.occasion),
      fitNotes: parsed.fitNotes ?? '',
      careText,
      basePrice: parsed.basePrice ?? '',
      discountEnabled: Boolean(parsed.discountEnabled),
      discountPercent: parsed.discountPercent ?? '',
      salePrice: parsed.salePrice ?? '',
      discountStartDate: parsed.discountStartDate ?? '',
      discountEndDate: parsed.discountEndDate ?? '',
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
