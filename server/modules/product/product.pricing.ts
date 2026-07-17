export function computeSalePriceFromDiscountPercent(
  basePrice: number,
  discountPercent: number,
): number {
  return Math.round(basePrice * (1 - discountPercent / 100));
}

export function computeDiscountPercentFromSalePrice(
  basePrice: number,
  salePrice: number,
): number {
  if (basePrice <= 0) {
    return 0;
  }

  return Math.round((1 - salePrice / basePrice) * 100);
}

export type DiscountableProduct = {
  basePrice: number;
  salePrice: number | null;
  discountPercent: number | null;
  discountEnabled: boolean;
  discountStartDate: Date | null;
  discountEndDate: Date | null;
};

export function isProductDiscountActive(
  product: DiscountableProduct,
  now = new Date(),
): boolean {
  const { basePrice, salePrice, discountEnabled, discountStartDate, discountEndDate } = product;

  return Boolean(
    discountEnabled &&
      salePrice != null &&
      salePrice > 0 &&
      salePrice < basePrice &&
      discountStartDate &&
      discountEndDate &&
      now >= discountStartDate &&
      now < discountEndDate,
  );
}

/**
 * Customer-facing price from basePrice and optional inline salePrice.
 */
export function computeEffectivePrice(product: DiscountableProduct, now = new Date()): number {
  return isProductDiscountActive(product, now)
    ? product.salePrice!
    : Math.round(product.basePrice);
}
