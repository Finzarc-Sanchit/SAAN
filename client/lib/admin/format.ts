export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatGrowthPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days),
  );
}

export function defaultStatisticsRange(now = new Date()): { from: string; to: string } {
  const to = addUtcDays(startOfUtcDay(now), 1);
  const from = addUtcDays(startOfUtcDay(now), -6);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function formatDisplayRange(fromIso: string, toIso: string): string {
  const from = new Date(fromIso);
  const toExclusive = new Date(toIso);
  const toInclusive = addUtcDays(toExclusive, -1);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  });

  return `${formatter.format(from)} to ${formatter.format(toInclusive)}`;
}

export function statisticsRangeForPeriod(
  period: 'monthly' | 'quarterly' | 'annually',
  now = new Date(),
): { from: string; to: string } {
  if (period === 'annually') {
    const year = now.getUTCFullYear();
    return {
      from: new Date(Date.UTC(year - 1, 0, 1)).toISOString(),
      to: new Date(Date.UTC(year + 1, 0, 1)).toISOString(),
    };
  }

  if (period === 'quarterly') {
    const year = now.getUTCFullYear();
    return {
      from: new Date(Date.UTC(year, 0, 1)).toISOString(),
      to: new Date(Date.UTC(year + 1, 0, 1)).toISOString(),
    };
  }

  // monthly — last ~12 months including current
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  return {
    from: new Date(Date.UTC(year, month - 11, 1)).toISOString(),
    to: new Date(Date.UTC(year, month + 1, 1)).toISOString(),
  };
}
