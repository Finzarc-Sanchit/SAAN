export const PRODUCT_VARIANT_PARAM = 'variant';

type ProductSlugSource = {
  slug?: string;
  id?: string;
};

export function getProductSlug(product: ProductSlugSource): string {
  if (product.slug) return product.slug;
  if (product.id) return product.id;
  throw new Error('Product slug is required');
}

export function getProductHref(
  product: ProductSlugSource | string,
  options?: { variant?: string | null },
): string {
  const slug = typeof product === 'string' ? product : getProductSlug(product);
  const base = `/shop/${slug}`;
  const variant = options?.variant?.trim();

  if (!variant) {
    return base;
  }

  const params = new URLSearchParams();
  params.set(PRODUCT_VARIANT_PARAM, variant);
  return `${base}?${params.toString()}`;
}

export function getVariantFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  const variant = searchParams.get(PRODUCT_VARIANT_PARAM)?.trim();
  return variant || null;
}
