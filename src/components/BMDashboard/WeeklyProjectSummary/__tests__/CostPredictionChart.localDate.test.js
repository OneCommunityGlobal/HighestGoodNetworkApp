import { describe, it, expect, vi, afterEach } from 'vitest';
import { getLocalDateString } from '../CostPredictionChart';

describe('getLocalDateString (End Date limit / clamp)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the local calendar date at the UTC day boundary', () => {
    // 6 p.m. and 11:59 p.m. local on Oct 5: in timezones behind UTC (e.g. Pacific)
    // the UTC date is already Oct 6, but the limit must stay Oct 5.
    expect(getLocalDateString(new Date(2026, 9, 5, 18, 0, 0))).toBe('2026-10-05');
    expect(getLocalDateString(new Date(2026, 9, 5, 23, 59, 59))).toBe('2026-10-05');
  });

  it('uses the local date just after local midnight', () => {
    // 12:30 a.m. local on Oct 6: in timezones ahead of UTC (e.g. India)
    // the UTC date is still Oct 5, but the limit must be Oct 6.
    expect(getLocalDateString(new Date(2026, 9, 6, 0, 30, 0))).toBe('2026-10-06');
  });

  it('pads single-digit months and days', () => {
    expect(getLocalDateString(new Date(2026, 0, 3, 9, 0, 0))).toBe('2026-01-03');
  });

  it('defaults to the current local date', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 5, 18, 0, 0));
    expect(getLocalDateString()).toBe('2026-10-05');
  });
});
