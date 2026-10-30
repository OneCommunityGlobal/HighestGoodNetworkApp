import { describe, it, expect } from 'vitest';
import { formatTimeDelay } from '../ProjectRiskProfileOverview';

describe('formatTimeDelay', () => {
  it('always shows two decimal places', () => {
    expect(formatTimeDelay(100)).toBe('100.00%');
    expect(formatTimeDelay(103.389)).toBe('103.39%');
    expect(formatTimeDelay(3.1)).toBe('3.10%');
  });

  it('handles negative changes', () => {
    expect(formatTimeDelay(-2.5)).toBe('-2.50%');
  });

  it('treats missing or invalid values as 0.00%', () => {
    expect(formatTimeDelay(undefined)).toBe('0.00%');
    expect(formatTimeDelay(null)).toBe('0.00%');
    expect(formatTimeDelay('abc')).toBe('0.00%');
  });
});
