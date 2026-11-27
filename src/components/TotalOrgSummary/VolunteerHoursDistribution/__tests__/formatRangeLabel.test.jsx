import { formatRangeLabel } from '../VolunteerHoursDistribution';

describe('formatRangeLabel helper', () => {
  it('formats backend upper-limit buckets correctly', () => {
    expect(formatRangeLabel('10')).toBe('0-10 hrs');
    expect(formatRangeLabel('20')).toBe('Over 10 to 20 hrs');
    expect(formatRangeLabel('30')).toBe('Over 20 to 30 hrs');
    expect(formatRangeLabel('40')).toBe('Over 30 to 40 hrs');
    expect(formatRangeLabel('50')).toBe('Over 40 to 50 hrs');
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

  it('labels cover fractional weekly averages placed in each bucket', () => {
    // Backend assignToBucket does not round: 10.5 -> '20', 20.5 -> '30', 30.5 -> '40', 40.5 -> '50'
    expect(formatRangeLabel('20')).toBe('Over 10 to 20 hrs');
    expect(formatRangeLabel('30')).toBe('Over 20 to 30 hrs');
    expect(formatRangeLabel('40')).toBe('Over 30 to 40 hrs');
    expect(formatRangeLabel('50')).toBe('Over 40 to 50 hrs');
  });
});
