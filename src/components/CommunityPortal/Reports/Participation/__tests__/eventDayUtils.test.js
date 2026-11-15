import { describe, it, expect } from 'vitest';
import { eventOccursOn, getEventDayKeys, getEventRange, getVisibleEvents } from '../eventDayUtils';

const at = (y, m, d, h = 0, min = 0) => new Date(y, m, d, h, min).toISOString();
const NOW = new Date(2026, 10, 14, 15, 0); // Nov 14 2026, 3pm

const morningToday = { id: 'a', startTime: at(2026, 10, 14, 9), endTime: at(2026, 10, 14, 10) };
const eveningToday = { id: 'b', startTime: at(2026, 10, 14, 18), endTime: at(2026, 10, 14, 19) };
const pastMidnight = { id: 'c', startTime: at(2026, 10, 15, 22), endTime: at(2026, 10, 16, 2) };
const multiDay = { id: 'd', startTime: at(2026, 10, 20, 9), endTime: at(2026, 10, 22, 17) };
const lastWeek = { id: 'e', startTime: at(2026, 10, 7, 9), endTime: at(2026, 10, 7, 10) };
const events = [multiDay, pastMidnight, eveningToday, morningToday, lastWeek];

const ids = list => list.map(e => e.id);

describe('getEventRange', () => {
  it('falls back to the start when the end is missing or before the start', () => {
    const start = at(2026, 10, 14, 9);
    expect(getEventRange({ startTime: start }).end.toISOString()).toBe(start);
    expect(
      getEventRange({ startTime: start, endTime: at(2026, 10, 14, 8) }).end.toISOString(),
    ).toBe(start);
  });

  it('returns null for an event without a valid date', () => {
    expect(getEventRange({ startTime: 'not a date' })).toBeNull();
  });
});

describe('eventOccursOn', () => {
  it('matches every day a multi-day event covers', () => {
    expect(eventOccursOn(multiDay, new Date(2026, 10, 19))).toBe(false);
    expect(eventOccursOn(multiDay, new Date(2026, 10, 20))).toBe(true);
    expect(eventOccursOn(multiDay, new Date(2026, 10, 21))).toBe(true);
    expect(eventOccursOn(multiDay, new Date(2026, 10, 22))).toBe(true);
    expect(eventOccursOn(multiDay, new Date(2026, 10, 23))).toBe(false);
  });

  it('matches both days of an event that runs past midnight', () => {
    expect(eventOccursOn(pastMidnight, new Date(2026, 10, 15))).toBe(true);
    expect(eventOccursOn(pastMidnight, new Date(2026, 10, 16))).toBe(true);
  });
});

describe('getEventDayKeys', () => {
  it('lists each covered day once', () => {
    expect(getEventDayKeys(multiDay)).toEqual([
      new Date(2026, 10, 20).toDateString(),
      new Date(2026, 10, 21).toDateString(),
      new Date(2026, 10, 22).toDateString(),
    ]);
  });
});

describe('getVisibleEvents', () => {
  it('shows only the selected day, including events earlier that day, sorted by start', () => {
    const result = getVisibleEvents(events, {
      filter: 'All Time',
      selectedDate: new Date(2026, 10, 14),
      now: NOW,
    });
    expect(ids(result)).toEqual(['a', 'b']);
  });

  it('includes a multi-day event on a middle day', () => {
    const result = getVisibleEvents(events, {
      filter: 'All Time',
      selectedDate: new Date(2026, 10, 21),
      now: NOW,
    });
    expect(ids(result)).toEqual(['d']);
  });

  it('returns nothing for a day with no events', () => {
    const result = getVisibleEvents(events, {
      filter: 'All Time',
      selectedDate: new Date(2026, 10, 18),
      now: NOW,
    });
    expect(result).toEqual([]);
  });

  it('keeps events from earlier today under "Today" and drops other days', () => {
    const result = getVisibleEvents(events, { filter: 'Today', selectedDate: null, now: NOW });
    expect(ids(result)).toEqual(['a', 'b']);
  });

  it('shows upcoming events from today onward under "All Time", without past days', () => {
    const result = getVisibleEvents(events, { filter: 'All Time', selectedDate: null, now: NOW });
    expect(ids(result)).toEqual(['a', 'b', 'c', 'd']);
  });
});
