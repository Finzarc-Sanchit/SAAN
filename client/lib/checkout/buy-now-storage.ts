import type { BuyNowItem } from '@/lib/types/checkout';

const BUY_NOW_STORAGE_KEY = 'saan-buy-now';
const CHECKOUT_STEP_STORAGE_KEY = 'saan-checkout-step';
const CHECKOUT_ADDRESS_STORAGE_KEY = 'saan-checkout-address';
const CHECKOUT_ORDER_STORAGE_KEY = 'saan-checkout-order';

export type StoredCheckoutStep = 'cart' | 'address' | 'payment';
const CHECKOUT_STEPS: StoredCheckoutStep[] = ['cart', 'address', 'payment'];

export function writeBuyNowItem(item: BuyNowItem): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(item));
  sessionStorage.setItem(CHECKOUT_STEP_STORAGE_KEY, 'cart');
  sessionStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY);
  sessionStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
}

export function readBuyNowItem(): BuyNowItem | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuyNowItem;
    if (
      !parsed?.productId ||
      !parsed?.sizeId ||
      !parsed?.name ||
      typeof parsed.quantity !== 'number'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearBuyNowItem(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
  sessionStorage.removeItem(CHECKOUT_STEP_STORAGE_KEY);
  sessionStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY);
  sessionStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
}

export function advanceCheckoutStep(step: StoredCheckoutStep): void {
  if (typeof window === 'undefined') return;
  const current = readHighestCheckoutStep();
  if (CHECKOUT_STEPS.indexOf(step) > CHECKOUT_STEPS.indexOf(current)) {
    sessionStorage.setItem(CHECKOUT_STEP_STORAGE_KEY, step);
  }
}

export function readHighestCheckoutStep(): StoredCheckoutStep {
  if (typeof window === 'undefined') return 'cart';
  const stored = sessionStorage.getItem(CHECKOUT_STEP_STORAGE_KEY);
  return CHECKOUT_STEPS.includes(stored as StoredCheckoutStep)
    ? (stored as StoredCheckoutStep)
    : 'cart';
}

export function canAccessCheckoutStep(step: StoredCheckoutStep): boolean {
  return CHECKOUT_STEPS.indexOf(step) <= CHECKOUT_STEPS.indexOf(readHighestCheckoutStep());
}

export function writeCheckoutAddressId(addressId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, addressId);
}

export function readCheckoutAddressId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
}

export function writePendingOrderId(orderId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CHECKOUT_ORDER_STORAGE_KEY, orderId);
}

export function readPendingOrderId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CHECKOUT_ORDER_STORAGE_KEY);
}

export function clearPendingOrderId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CHECKOUT_ORDER_STORAGE_KEY);
}
