export const ORDER_CONSTANTS = {
  CURRENCY: 'INR',
  /** Flat shipping charge when subtotal is below the free-shipping threshold. */
  STANDARD_SHIPPING_CHARGE: 99,
  /** Orders at or above this merchandise total ship free. */
  FREE_SHIPPING_MIN_SUBTOTAL: 5000,
  /** How long a completed idempotency key remains valid (24 hours). */
  IDEMPOTENCY_TTL_SECONDS: 24 * 60 * 60,
  IDEMPOTENCY_SCOPE: 'order',
} as const;
