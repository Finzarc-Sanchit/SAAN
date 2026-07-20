import { ORDER_CONSTANTS } from './order.constants';

export type OrderPricingLine = {
  quantity: number;
  basePrice: number;
  unitPrice: number;
};

export type OrderPricingTotals = {
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
};

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function computeShippingCharge(merchandiseTotal: number): number {
  if (ORDER_CONSTANTS.STANDARD_SHIPPING_CHARGE <= 0) {
    return 0;
  }

  if (merchandiseTotal >= ORDER_CONSTANTS.FREE_SHIPPING_MIN_SUBTOTAL) {
    return 0;
  }

  return ORDER_CONSTANTS.STANDARD_SHIPPING_CHARGE;
}

export function computeOrderTotals(lines: OrderPricingLine[]): OrderPricingTotals {
  const subtotal = roundMoney(
    lines.reduce((sum, line) => sum + line.quantity * line.basePrice, 0),
  );
  const merchandiseTotal = roundMoney(
    lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
  );
  const discount = roundMoney(subtotal - merchandiseTotal);
  const shippingCharge = computeShippingCharge(merchandiseTotal);
  const total = roundMoney(merchandiseTotal + shippingCharge);

  return {
    subtotal,
    discount,
    shippingCharge,
    total,
  };
}
