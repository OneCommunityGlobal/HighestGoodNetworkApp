import { describe, it, expect } from 'vitest';
import {
  MAX_EVENT_SPAN_DAYS,
  eventOccursOn,
  getCalendarDayKeys,
  getEmptyMessage,
  getEventDayKeys,
  getEventRange,
  getFilterRange,
  getRangeEvents,
  getVisibleEvents,
  isDayInFilter,
} from '../eventDayUtils';

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

  it('drops events that already ended earlier today and other days under "Today"', () => {
    const result = getVisibleEvents(events, { filter: 'Today', selectedDate: null, now: NOW });
    expect(ids(result)).toEqual(['b']);
  });

  it('shows only events that have not ended under "All Time"', () => {
    const result = getVisibleEvents(events, { filter: 'All Time', selectedDate: null, now: NOW });
    expect(ids(result)).toEqual(['b', 'c', 'd']);
  });

  // NOW is Saturday Nov 14, so This Week is Sun Nov 8 - Sat Nov 14
  it('includes an event that started before the week but is still running under "This Week"', () => {
    const spanning = { id: 'f', startTime: at(2026, 10, 6, 9), endTime: at(2026, 10, 15, 17) };
    const result = getVisibleEvents([...events, spanning], {
      filter: 'This Week',
      selectedDate: null,
      now: NOW,
    });
    expect(ids(result)).toEqual(['f', 'b']);
  });

  it('includes an event that started last month but is still running under "This Month"', () => {
    const spanning = { id: 'g', startTime: at(2026, 9, 30, 9), endTime: at(2026, 10, 15, 17) };
    const result = getVisibleEvents([...events, spanning], {
      filter: 'This Month',
      selectedDate: null,
      now: NOW,
    });
    expect(ids(result)).toEqual(['g', 'b', 'c', 'd']);
  });

  it('limits a picked day to the dropdown range', () => {
    const nov20 = new Date(2026, 10, 20);
    expect(
      getVisibleEvents(events, { filter: 'This Week', selectedDate: nov20, now: NOW }),
    ).toEqual([]);
    expect(
      ids(getVisibleEvents(events, { filter: 'This Month', selectedDate: nov20, now: NOW })),
    ).toEqual(['d']);
  });
});

describe('getRangeEvents', () => {
  it('keeps every event in the range, including ones that already ended, for the calendar', () => {
    expect(ids(getRangeEvents(events, { filter: 'This Week', now: NOW })).sort()).toEqual([
      'a',
      'b',
    ]);
    expect(getRangeEvents(events, { filter: 'All Time', now: NOW })).toHaveLength(events.length);
  });
});

describe('getCalendarDayKeys', () => {
  it('puts dots only on days inside the dropdown range', () => {
    // Runs Thu Nov 12 - Mon Nov 16; This Week ends Sat Nov 14
    const spanning = { id: 'f', startTime: at(2026, 10, 12, 9), endTime: at(2026, 10, 16, 17) };
    expect(getCalendarDayKeys(spanning, 'This Week', NOW)).toEqual([
      new Date(2026, 10, 12).toDateString(),
      new Date(2026, 10, 13).toDateString(),
      new Date(2026, 10, 14).toDateString(),
    ]);
    expect(getCalendarDayKeys(spanning, 'All Time', NOW)).toEqual(getEventDayKeys(spanning));
  });

  it('shows nothing in Card/List for a picked day outside the range', () => {
    const spanning = { id: 'f', startTime: at(2026, 10, 12, 9), endTime: at(2026, 10, 16, 17) };
    expect(
      getVisibleEvents([spanning], {
        filter: 'This Week',
        selectedDate: new Date(2026, 10, 16),
        now: NOW,
      }),
    ).toEqual([]);
  });
});

describe('getFilterRange', () => {
  it('runs This Week from Sunday to the end of Saturday', () => {
    const { start, end } = getFilterRange('This Week', NOW);
    expect(start).toEqual(new Date(2026, 10, 8));
    expect(end).toEqual(new Date(2026, 10, 14, 23, 59, 59, 999));
  });

  it('runs This Month from the 1st to the end of the last day', () => {
    const { start, end } = getFilterRange('This Month', NOW);
    expect(start).toEqual(new Date(2026, 10, 1));
    expect(end).toEqual(new Date(2026, 10, 30, 23, 59, 59, 999));
  });

  it('has no limit for All Time', () => {
    expect(getFilterRange('All Time', NOW)).toBeNull();
  });
});

describe('isDayInFilter', () => {
  it('checks the picked day against the dropdown range', () => {
    const nov20 = new Date(2026, 10, 20);
    expect(isDayInFilter(nov20, 'This Week', NOW)).toBe(false);
    expect(isDayInFilter(nov20, 'This Month', NOW)).toBe(true);
    expect(isDayInFilter(nov20, 'All Time', NOW)).toBe(true);
  });
});

describe('events longer than the span cap', () => {
  const long = { id: 'h', startTime: at(2026, 10, 1, 9), endTime: at(2026, 11, 31, 17) };
  const lastCoveredDay = new Date(2026, 11, 1);
  const dayAfter = new Date(2026, 11, 2);

  it('gives the calendar dots and the list the same last day', () => {
    const keys = getEventDayKeys(long);
    expect(keys).toHaveLength(MAX_EVENT_SPAN_DAYS);
    expect(keys.at(-1)).toBe(lastCoveredDay.toDateString());

    const onDay = day =>
      ids(getVisibleEvents([long], { filter: 'All Time', selectedDate: day, now: NOW }));
    expect(onDay(lastCoveredDay)).toEqual(['h']);
    expect(onDay(dayAfter)).toEqual([]);
    expect(eventOccursOn(long, dayAfter)).toBe(false);
  });
});

describe('getEventDayKeys across a month boundary', () => {
  it('rolls over from Nov 30 to Dec 1', () => {
    const event = { startTime: at(2026, 10, 30, 20), endTime: at(2026, 11, 1, 2) };
    expect(getEventDayKeys(event)).toEqual([
      new Date(2026, 10, 30).toDateString(),
      new Date(2026, 11, 1).toDateString(),
    ]);
  });
});

describe('getEmptyMessage', () => {
  it('names the picked day, the range, or falls back to upcoming', () => {
    expect(getEmptyMessage(new Date(2026, 10, 18), 'All Time')).toBe(
      'No events on November 18, 2026.',
    );
    expect(getEmptyMessage(null, 'This Week')).toBe('No upcoming events for this week.');
    expect(getEmptyMessage(null, 'All Time')).toBe('No upcoming events.');
    expect(getEmptyMessage(new Date(2026, 10, 18), 'This Week')).toBe(
      'No events on November 18, 2026 within this week.',
    );
  });
});
