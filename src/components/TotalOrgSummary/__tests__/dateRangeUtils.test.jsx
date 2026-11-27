import { describe, expect, it } from 'vitest';

import {
  formatLocalDateForApi,
  getCurrentWeekDates,
  getPreviousWeekDates,
} from '../dateRangeUtils';

describe('TotalOrgSummary date range utilities', () => {
  it('returns the current Sunday through Saturday range for current week', () => {
    const result = getCurrentWeekDates(new Date('2026-06-25T12:00:00'));

    expect(result).toEqual({
      start: '2026-06-21',
      end: '2026-06-27',
    });
  });

  it('returns the previous Sunday through Saturday range for previous week', () => {
    const result = getPreviousWeekDates(new Date('2026-06-25T12:00:00'));

    expect(result).toEqual({
      start: '2026-06-14',
      end: '2026-06-20',
    });
  });

  it('formats custom date picker values without UTC shifting', () => {
    const result = formatLocalDateForApi(new Date(2026, 5, 21, 0, 0, 0));

    expect(result).toBe('2026-06-21');
  });
});
