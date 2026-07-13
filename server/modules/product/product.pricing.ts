import type { Discount } from '../discount/discount.types';

export type DiscountLike = Pick<Discount, 'type' | 'value' | 'validFrom' | 'validTo'>;

function isDiscountActive(discount: DiscountLike, at: Date): boolean {
  return at >= discount.validFrom && at <= discount.validTo;
}

/**
 * Resolves the customer-facing price from basePrice and an optional referenced discount.
 */
export function computeEffectivePrice(
  basePrice: number,
  discount: DiscountLike | null,
  at: Date = new Date(),
): number {
  if (!discount || !isDiscountActive(discount, at)) {
    return roundMoney(basePrice);
  }

  const { type, value } = discount;
  const discounted =
    type === 'percentage' ? basePrice * (1 - value / 100) : Math.max(0, basePrice - value);

  return roundMoney(Math.max(0, discounted));
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
