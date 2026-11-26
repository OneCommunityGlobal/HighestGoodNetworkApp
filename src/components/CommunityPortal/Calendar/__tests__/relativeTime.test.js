import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '../relativeTime';

const NOW = new Date(2026, 10, 5, 12, 0, 0).getTime();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
  it('shows "just now" under a minute and for future timestamps', () => {
    expect(formatRelativeTime(NOW - 30 * 1000, NOW)).toBe('just now');
    expect(formatRelativeTime(NOW + 5 * MIN, NOW)).toBe('just now');
  });

  it('shows minutes under an hour', () => {
    expect(formatRelativeTime(NOW - 2 * MIN, NOW)).toBe('2 min ago');
    expect(formatRelativeTime(NOW - 59 * MIN, NOW)).toBe('59 min ago');
  });

  it('shows hours under a day, with singular and plural', () => {
    expect(formatRelativeTime(NOW - HOUR, NOW)).toBe('1 hour ago');
    expect(formatRelativeTime(NOW - 3 * HOUR, NOW)).toBe('3 hours ago');
  });

  it('shows days under a week', () => {
    expect(formatRelativeTime(NOW - DAY, NOW)).toBe('1 day ago');
    expect(formatRelativeTime(NOW - 3 * DAY, NOW)).toBe('3 days ago');
  });

  it('shows the date for anything older than a week', () => {
    const old = NOW - 10 * DAY;
    expect(formatRelativeTime(old, NOW)).toBe(new Date(old).toLocaleDateString());
  });
});
