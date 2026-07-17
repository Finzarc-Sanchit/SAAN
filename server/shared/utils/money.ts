/**
 * Convert a major-unit amount (e.g. rupees) to the smallest currency unit
 * expected by payment gateways (e.g. paise for INR).
 */
export function toSmallestCurrencyUnit(amount: number, currency: string): number {
  const normalized = currency.trim().toUpperCase();

  // Most ISO 4217 currencies use 2 decimal places; extend if zero-decimal
  // currencies (JPY, KRW, etc.) are added later.
  if (normalized === 'JPY' || normalized === 'KRW') {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
}
