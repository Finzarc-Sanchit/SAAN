import { describe, expect, it } from '@jest/globals';
import {
  buildDayAvailability,
  generateTimeSlots,
  getWeekdayForDate,
  timeToMinutes,
} from './appointment-availability.util';
import { DEFAULT_APPOINTMENT_SETTINGS } from './appointment.constants';
import type { AppointmentSettings } from './appointment.types';

const settings: AppointmentSettings = {
  id: 'settings-1',
  ...DEFAULT_APPOINTMENT_SETTINGS,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('appointment-availability.util', () => {
  it('generates slots from opening to closing using duration and buffer', () => {
    expect(
      generateTimeSlots({
        openingTime: '10:00',
        closingTime: '12:00',
        slotDurationMinutes: 30,
        bufferMinutes: 0,
      }),
    ).toEqual(['10:00', '10:30', '11:00', '11:30']);

    expect(
      generateTimeSlots({
        openingTime: '10:00',
        closingTime: '12:00',
        slotDurationMinutes: 30,
        bufferMinutes: 30,
      }),
    ).toEqual(['10:00', '11:00']);
  });

  it('resolves weekdays in Asia/Kolkata', () => {
    // 2026-07-21 is a Tuesday
    expect(getWeekdayForDate('2026-07-21', 'Asia/Kolkata')).toBe(2);
    expect(getWeekdayForDate('2026-07-20', 'Asia/Kolkata')).toBe(1);
  });

  it('marks closed weekdays and holidays', () => {
    const monday = buildDayAvailability({
      settings,
      dateString: '2026-07-20',
      bookedSlots: new Set(),
      bookedCount: 0,
      now: new Date('2026-07-01T00:00:00Z'),
    });
    expect(monday.isOpen).toBe(false);
    expect(monday.closedReason).toBe('weekday');

    const holidaySettings = {
      ...settings,
      holidays: ['2026-07-21'],
    };
    const holiday = buildDayAvailability({
      settings: holidaySettings,
      dateString: '2026-07-21',
      bookedSlots: new Set(),
      bookedCount: 0,
      now: new Date('2026-07-01T00:00:00Z'),
    });
    expect(holiday.isOpen).toBe(false);
    expect(holiday.closedReason).toBe('holiday');
  });

  it('keeps booked slots visible but unavailable', () => {
    const day = buildDayAvailability({
      settings,
      dateString: '2026-07-21',
      bookedSlots: new Set(['11:00']),
      bookedCount: 1,
      now: new Date('2026-07-01T00:00:00Z'),
    });

    expect(day.isOpen).toBe(true);
    const slot = day.slots.find((entry) => entry.time === '11:00');
    expect(slot).toEqual({ time: '11:00', available: false, reason: 'booked' });
    expect(day.slots.some((entry) => entry.available)).toBe(true);
  });

  it('parses HH:mm into minutes', () => {
    expect(timeToMinutes('11:30')).toBe(11 * 60 + 30);
  });
});
