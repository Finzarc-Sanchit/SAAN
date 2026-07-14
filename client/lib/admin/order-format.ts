import { addUtcDays } from '@/lib/admin/format';
import { dateInputToIso, toDateInputValue } from '@/lib/admin/date-range-status';

export function formatShortOrderId(orderId: string): string {
  const compact = orderId.replace(/[^a-f0-9]/gi, '');
  const tail = compact.slice(-8).toUpperCase();
  return `#${tail || orderId.slice(0, 8)}`;
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
