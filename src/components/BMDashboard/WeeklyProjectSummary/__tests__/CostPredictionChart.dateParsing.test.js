import { parseMonthLabel, parseIsoDateOnly } from '../CostPredictionChart';

describe('parseMonthLabel', () => {
  it.each([
    ['January 2026', 2026, 0],
    ['March 2026', 2026, 2],
    ['December 2025', 2025, 11],
  ])('parses "%s" into year %i, month index %i', (label, year, monthIndex) => {
    const result = parseMonthLabel(label);
    expect(result.getFullYear()).toBe(year);
    expect(result.getMonth()).toBe(monthIndex);
    expect(result.getDate()).toBe(1);
  });

  it('is case-insensitive on the month name', () => {
    const result = parseMonthLabel('march 2026');
    expect(result.getMonth()).toBe(2);
  });

  it('returns an invalid Date for malformed input', () => {
    expect(Number.isNaN(parseMonthLabel('not a date').getTime())).toBe(true);
    expect(Number.isNaN(parseMonthLabel('').getTime())).toBe(true);
    expect(Number.isNaN(parseMonthLabel(null).getTime())).toBe(true);
    expect(Number.isNaN(parseMonthLabel('Marchtober 2026').getTime())).toBe(true);
  });
});

describe('parseIsoDateOnly', () => {
  it('parses a YYYY-MM-DD string into a local Date with matching Y/M/D', () => {
    const result = parseIsoDateOnly('2026-03-17');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2); // March = index 2
    expect(result.getDate()).toBe(17);
  });

  it('does not shift the date across a month/day boundary regardless of local timezone', () => {
    // This is the core regression check: new Date('2026-03-01') (native
    // constructor) can resolve to Feb 28 in timezones behind UTC. Our
    // parser must never do that.
    const result = parseIsoDateOnly('2026-03-01');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(1);
  });

  it('returns null for empty/undefined input', () => {
    expect(parseIsoDateOnly('')).toBeNull();
    expect(parseIsoDateOnly(undefined)).toBeNull();
    expect(parseIsoDateOnly(null)).toBeNull();
  });
});
