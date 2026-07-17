export type DateRangeStatus = 'active' | 'upcoming' | 'expired';

export function getDateRangeStatus(
  rangeStart: string | Date,
  rangeEnd: string | Date,
  now = new Date(),
): DateRangeStatus {
  const start = new Date(rangeStart).getTime();
  const end = new Date(rangeEnd).getTime();
  const current = now.getTime();

  if (current < start) return 'upcoming';
  if (current >= end) return 'expired';
  return 'active';
}

export function formatAdminDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function toDateInputValue(value: string | Date | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateInputToIso(value: string): string {
  return new Date(`${value}T00:00:00`).toISOString();
}

export function toDateTimeLocalInputValue(value: string | Date | undefined | null): string {
  if (!value) return '';
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function dateTimeLocalInputToIso(value: string): string {
  return new Date(value).toISOString();
}
