/** Returns the final product image for card hover, or the primary image as fallback. */
export function getProductHoverImage(
  images: readonly string[] | undefined,
  primaryImage: string,
): string {
  return images?.[images.length - 1] ?? primaryImage;
}
