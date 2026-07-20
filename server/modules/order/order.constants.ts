export const ORDER_CONSTANTS = {
  CURRENCY: 'INR',
  /**
   * Shipping is complimentary across India (matches bag/checkout UI and brand trust copy).
   * Kept as a constant so a future paid rate can be reintroduced without rewriting callers.
   */
  STANDARD_SHIPPING_CHARGE: 0,
  /** Merchandise total at/above which shipping is free. With charge 0, all orders ship free. */
  FREE_SHIPPING_MIN_SUBTOTAL: 0,
  /** How long a completed idempotency key remains valid (24 hours). */
  IDEMPOTENCY_TTL_SECONDS: 24 * 60 * 60,
  IDEMPOTENCY_SCOPE: 'order',
  /**
   * Customer-facing order id — Amazon-style `###-#######-#######`
   * e.g. `407-1298468-3682757`
   */
  ORDER_NUMBER_PATTERN: /^\d{3}-\d{7}-\d{7}$/,
} as const;
