import type { ProductImage } from './product.types';

/** First gallery image by sortOrder — matches storefront product cards. */
export function getPrimaryProductImageUrl(
  images: Pick<ProductImage, 'imageUrl' | 'sortOrder'>[] | undefined,
): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const url = sorted[0]?.imageUrl?.trim();
  return url || null;
}
