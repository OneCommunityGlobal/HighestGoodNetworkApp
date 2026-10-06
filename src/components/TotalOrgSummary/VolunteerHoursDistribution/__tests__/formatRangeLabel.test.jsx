import { formatRangeLabel } from '../VolunteerHoursDistribution';

describe('formatRangeLabel helper', () => {
  it('formats backend upper-limit buckets correctly', () => {
    expect(formatRangeLabel('10')).toBe('0-10 hrs');
    expect(formatRangeLabel('20')).toBe('11-20 hrs');
    expect(formatRangeLabel('30')).toBe('21-30 hrs');
    expect(formatRangeLabel('40')).toBe('31-40 hrs');
    expect(formatRangeLabel('50')).toBe('41-50 hrs');
  });

  it('formats plus ranges correctly', () => {
    expect(formatRangeLabel('40+')).toBe('Over 40 hrs');
    expect(formatRangeLabel('50+')).toBe('Over 50 hrs');
  });

  it('handles empty or undefined input gracefully', () => {
    expect(formatRangeLabel('')).toBe('');
    expect(formatRangeLabel(null)).toBe('');
    expect(formatRangeLabel(undefined)).toBe('');
  });
});
