import { formatRangeLabel } from '../VolunteerHoursDistribution';

describe('formatRangeLabel helper', () => {
  it('formats simple numeric ranges correctly', () => {
    expect(formatRangeLabel('10')).toBe('10-19.99 hrs');
    expect(formatRangeLabel('0')).toBe('0-9.99 hrs');
  });

  it('formats open-ended ranges correctly', () => {
    expect(formatRangeLabel('50+')).toBe('50+ hrs');
    expect(formatRangeLabel('40+')).toBe('50+ hrs'); // special-case remap
  });

  it('handles empty or undefined input gracefully', () => {
    expect(formatRangeLabel('')).toBe('');
    expect(formatRangeLabel(null)).toBe('');
    expect(formatRangeLabel(undefined)).toBe('');
  });
});
