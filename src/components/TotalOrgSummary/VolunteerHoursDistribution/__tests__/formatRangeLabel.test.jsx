import { formatRangeLabel } from '../VolunteerHoursDistribution';

describe('formatRangeLabel helper', () => {
  it('formats simple numeric ranges correctly', () => {
    expect(formatRangeLabel('10')).toBe('10-19 hrs');
    expect(formatRangeLabel('20')).toBe('20-29 hrs');
    expect(formatRangeLabel('30')).toBe('30-39 hrs');
    expect(formatRangeLabel('40')).toBe('40-49 hrs');
  });

  it('formats plus ranges correctly', () => {
    expect(formatRangeLabel('40+')).toBe('40+ hrs');
    expect(formatRangeLabel('50+')).toBe('50+ hrs');
  });

  it('handles empty or undefined input gracefully', () => {
    expect(formatRangeLabel('')).toBe('');
    expect(formatRangeLabel(null)).toBe('');
    expect(formatRangeLabel(undefined)).toBe('');
  });
});