import { addUtcDays } from '@/lib/admin/format';
import { dateInputToIso, toDateInputValue } from '@/lib/admin/date-range-status';

/** Amazon-style marketplace order id: `407-1298468-3682757` */
const ORDER_NUMBER_RE = /^\d{3}-\d{7}-\d{7}$/;

export function isOrderNumber(value: string): boolean {
  return ORDER_NUMBER_RE.test(value.trim());
}

/**
 * Display label for a customer-facing order id (e.g. #407-1298468-3682757).
 */
export function formatShortOrderId(orderNumber: string): string {
  const normalized = orderNumber.trim();
  if (!ORDER_NUMBER_RE.test(normalized)) {
    throw new Error('Expected a customer-facing order id (###-#######-#######)');
  }
  return `#${normalized}`;
}

/**
 * Public URL segment for orders — always ###-#######-#######.
 * Never returns a Mongo ObjectId.
 */
export function getOrderPublicRef(order: { orderNumber?: string }): string {
  const number = order.orderNumber?.trim() ?? '';
  if (!ORDER_NUMBER_RE.test(number)) {
    throw new Error('Order is missing a customer-facing order id');
  }
  return number;
}

export function formatOrderDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Inclusive date-range query: `to` is sent as start of the day after the selected end date. */
export function orderListDateRangeQuery(fromInput: string, toInput: string): {
  from?: string;
  to?: string;
} {
  if (!fromInput && !toInput) {
    return {};
  }

  const result: { from?: string; to?: string } = {};
  if (fromInput) {
    result.from = dateInputToIso(fromInput);
  }
  if (toInput) {
    const endExclusive = addUtcDays(new Date(`${toInput}T00:00:00`), 1);
    result.to = endExclusive.toISOString();
  }
  return result;
}

export { toDateInputValue };
