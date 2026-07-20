/** Returns the final product image for card hover, or the primary image as fallback. */
export function getProductHoverImage(
  images: readonly string[] | undefined,
  primaryImage: string,
): string {
  return images?.[images.length - 1] ?? primaryImage;
}

/** First gallery image by sortOrder — matches storefront product cards. */
export function getPrimaryProductImageUrl(
  images: { imageUrl: string; sortOrder: number }[] | undefined,
): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const url = sorted[0]?.imageUrl?.trim();
  return url || null;
}
