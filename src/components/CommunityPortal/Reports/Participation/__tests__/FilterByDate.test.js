import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { filterEventsByDate } from '../FilterByDate';

describe('filterEventsByDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-02T12:00:00-05:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('includes multi-day and midnight-spanning events on a selected local date', () => {
    const events = [
      {
        id: 'multi-day',
        eventDate: '2026-11-01T20:00:00-05:00',
        startTime: '2026-11-01T20:00:00-05:00',
        endTime: '2026-11-03T09:00:00-05:00',
      },
      {
        id: 'midnight',
        eventDate: '2026-11-02T23:30:00-05:00',
        startTime: '2026-11-02T23:30:00-05:00',
        endTime: '2026-11-03T00:30:00-05:00',
      },
      {
        id: 'different-day',
        eventDate: '2026-11-04T10:00:00-05:00',
        startTime: '2026-11-04T10:00:00-05:00',
        endTime: '2026-11-04T11:00:00-05:00',
      },
    ];

    expect(
      filterEventsByDate(events, 'Specific Date', '2026-11-02').map(event => event.id),
    ).toEqual(['multi-day', 'midnight']);
  });

  it('sorts valid events by start time and drops invalid dates', () => {
    const events = [
      { id: 'later', eventDate: '2026-11-04T10:00:00-05:00' },
      { id: 'invalid', eventDate: 'not-a-date' },
      { id: 'earlier', eventDate: '2026-11-03T10:00:00-05:00' },
    ];

    expect(filterEventsByDate(events, 'All Time').map(event => event.id)).toEqual([
      'earlier',
      'later',
    ]);
  });
});
