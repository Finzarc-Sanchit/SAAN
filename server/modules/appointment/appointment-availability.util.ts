import { DATE_STRING_REGEX, TIME_STRING_REGEX } from './appointment.constants';
import type {
  AppointmentSettings,
  DayAvailability,
  SpecialOpeningDay,
  TimeSlotAvailability,
  Weekday,
} from './appointment.types';

export type SlotGenerationInput = {
  openingTime: string;
  closingTime: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
};

/** Parses HH:mm into minutes from midnight. */
export function timeToMinutes(time: string): number {
  const match = TIME_STRING_REGEX.exec(time);
  if (!match) {
    throw new Error(`Invalid time string: ${time}`);
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Formats minutes from midnight as HH:mm. */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Generates bookable start times from opening to closing.
 * The last slot must finish at or before closing time.
 */
export function generateTimeSlots(input: SlotGenerationInput): string[] {
  const { openingTime, closingTime, slotDurationMinutes, bufferMinutes } = input;
  if (slotDurationMinutes < 15 || slotDurationMinutes > 240) {
    return [];
  }

  const open = timeToMinutes(openingTime);
  const close = timeToMinutes(closingTime);
  if (close <= open) {
    return [];
  }

  const step = slotDurationMinutes + Math.max(0, bufferMinutes);
  const slots: string[] = [];

  for (let cursor = open; cursor + slotDurationMinutes <= close; cursor += step) {
    slots.push(minutesToTime(cursor));
  }

  return slots;
}

/** Calendar date YYYY-MM-DD in the given IANA timezone. */
export function formatDateInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Weekday 0=Sunday … 6=Saturday in the given timezone for a calendar date. */
export function getWeekdayForDate(dateString: string, timeZone: string): Weekday {
  assertDateString(dateString);
  const probe = new Date(`${dateString}T12:00:00.000Z`);
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(probe);

  const map: Record<string, Weekday> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const weekday = map[label];
  if (weekday === undefined) {
    throw new Error(`Unable to resolve weekday for ${dateString}`);
  }
  return weekday;
}

/**
 * Converts a local atelier date+time into a UTC Date.
 * Asia/Kolkata uses a fixed +05:30 offset (no DST).
 */
export function zonedDateTimeToUtc(
  dateString: string,
  time: string,
  timeZone: string,
): Date {
  assertDateString(dateString);
  assertTimeString(time);

  if (timeZone === 'Asia/Kolkata') {
    const [year, month, day] = dateString.split('-').map(Number) as [number, number, number];
    const [hours, minutes] = time.split(':').map(Number) as [number, number];
    return new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30));
  }

  // Fallback: treat as UTC wall clock when an unsupported zone is configured.
  return new Date(`${dateString}T${time}:00.000Z`);
}

export function assertDateString(value: string): void {
  if (!DATE_STRING_REGEX.test(value)) {
    throw new Error(`Invalid date string: ${value}`);
  }
}

export function assertTimeString(value: string): void {
  if (!TIME_STRING_REGEX.test(value)) {
    throw new Error(`Invalid time string: ${value}`);
  }
}

export function findSpecialOpeningDay(
  settings: AppointmentSettings,
  dateString: string,
): SpecialOpeningDay | undefined {
  return settings.specialOpeningDays.find((day) => day.date === dateString);
}

export function isHoliday(settings: AppointmentSettings, dateString: string): boolean {
  return settings.holidays.includes(dateString);
}

export function findTemporaryClosure(
  settings: AppointmentSettings,
  dateString: string,
): { date: string; reason?: string } | undefined {
  return settings.temporaryClosures.find((closure) => closure.date === dateString);
}

export function getEffectiveHours(
  settings: AppointmentSettings,
  dateString: string,
): { isOpen: boolean; openingTime?: string; closingTime?: string; closedReason?: DayAvailability['closedReason'] } {
  const special = findSpecialOpeningDay(settings, dateString);
  if (special) {
    return {
      isOpen: true,
      openingTime: special.openingTime,
      closingTime: special.closingTime,
    };
  }

  if (isHoliday(settings, dateString)) {
    return { isOpen: false, closedReason: 'holiday' };
  }

  const temporary = findTemporaryClosure(settings, dateString);
  if (temporary) {
    return { isOpen: false, closedReason: 'temporary_closure' };
  }

  const weekday = getWeekdayForDate(dateString, settings.timezone);
  if (!settings.workingDays.includes(weekday)) {
    return { isOpen: false, closedReason: 'weekday' };
  }

  return {
    isOpen: true,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
  };
}

export type BuildDayAvailabilityInput = {
  settings: AppointmentSettings;
  dateString: string;
  bookedSlots: ReadonlySet<string>;
  bookedCount: number;
  now?: Date;
};

/** Builds full-day availability including unavailable (booked/past) slots. */
export function buildDayAvailability(input: BuildDayAvailabilityInput): DayAvailability {
  const { settings, dateString, bookedSlots, bookedCount } = input;
  const now = input.now ?? new Date();
  const today = formatDateInTimezone(now, settings.timezone);

  const hours = getEffectiveHours(settings, dateString);
  const base: DayAvailability = {
    date: dateString,
    isOpen: hours.isOpen,
    closedReason: hours.closedReason,
    openingTime: hours.openingTime,
    closingTime: hours.closingTime,
    slotDurationMinutes: settings.slotDurationMinutes,
    slots: [],
    bookedCount,
    maxAppointmentsPerDay: settings.maxAppointmentsPerDay,
  };

  if (dateString < today) {
    return { ...base, isOpen: false, closedReason: 'past', slots: [] };
  }

  if (!hours.isOpen || !hours.openingTime || !hours.closingTime) {
    return base;
  }

  const generated = generateTimeSlots({
    openingTime: hours.openingTime,
    closingTime: hours.closingTime,
    slotDurationMinutes: settings.slotDurationMinutes,
    bufferMinutes: settings.bufferMinutes,
  });

  const dayFullyBooked = bookedCount >= settings.maxAppointmentsPerDay;

  const slots: TimeSlotAvailability[] = generated.map((time) => {
    const startsAt = zonedDateTimeToUtc(dateString, time, settings.timezone);
    if (startsAt.getTime() <= now.getTime()) {
      return { time, available: false, reason: 'past' };
    }
    if (bookedSlots.has(time)) {
      return { time, available: false, reason: 'booked' };
    }
    if (dayFullyBooked) {
      return { time, available: false, reason: 'booked' };
    }
    return { time, available: true };
  });

  return {
    ...base,
    isOpen: !dayFullyBooked,
    closedReason: dayFullyBooked ? 'fully_booked' : hours.closedReason,
    slots,
  };
}

export function isSlotAvailableOnDay(
  availability: DayAvailability,
  timeSlot: string,
): boolean {
  const slot = availability.slots.find((entry) => entry.time === timeSlot);
  return Boolean(slot?.available);
}
