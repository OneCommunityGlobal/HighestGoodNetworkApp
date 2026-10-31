import { describe, it, expect } from 'vitest';
import { exactRatePValue, holmAdjust, severitySignificance } from './injurySignificance';

const record = (workerCategory, severity, count) => ({ workerCategory, severity, count });
const period = (records, days = 10) => ({ days, buckets: [{ records }] });

describe('exact injury rate comparisons', () => {
  it.each([
    [0, 10, 1, 1, 2 / 1024],
    [1, 9, 1, 1, 22 / 1024],
    [0, 5, 1, 2, 43 / 243],
    [10, 10, 1, 1, 1],
    [1000, 1000, 1, 1, 1],
  ])(
    'matches exact two-sided probabilities for %i/%i events over %i/%i days',
    (a, b, daysA, daysB, expected) => {
      expect(exactRatePValue(a, b, daysA, daysB)).toBeCloseTo(expected, 12);
      expect(exactRatePValue(b, a, daysB, daysA)).toBeCloseTo(expected, 12);
    },
  );

  it('declines invalid counts, zero events, invalid exposure and unsupported totals', () => {
    [
      [0, 0, 1, 1],
      [-1, 10, 1, 1],
      [1.5, 10, 1, 1],
      [1, 10, 0, 1],
      [1, 10, Infinity, 1],
      [1000000, 1, 1, 1],
    ].forEach(args => {
      expect(exactRatePValue(...args)).toBeNull();
    });
  });

  it('applies Holm adjustment in original order and preserves unassessable results', () => {
    expect(holmAdjust([0.04, 0.01, 0.03])).toEqual([0.06, 0.03, 0.06]);
    expect(holmAdjust([0.01, null, 0.03])).toEqual([0.03, null, 0.06]);
  });

  it('uses rates for direction, stratifies severity and aggregates repeated buckets', () => {
    const a = period([record('Staff', 'Serious', 10), record('Staff', 'Low', 1)], 1);
    const b = period([record('Staff', 'Serious', 20), record('Staff', 'Low', 100)], 10);
    b.buckets.push({ records: [record('Staff', 'Low', 100)] });
    const result = severitySignificance(a, b);
    expect(result.testedCount).toBe(2);
    expect(result.rows.find(row => row.severity === 'Serious')).toMatchObject({
      status: 'decrease',
      countA: 10,
      countB: 20,
      rateA: 10,
      rateB: 2,
    });
    expect(result.rows.find(row => row.severity === 'Low')).toMatchObject({
      status: 'increase',
      countB: 200,
    });
  });

  it('keeps ordinary change separate from significance after multiple testing', () => {
    // A single 1→9 comparison has p=22/1024, but three tested combinations
    // increase its Holm-adjusted p to 66/1024 (>0.05).
    const result = severitySignificance(
      period([record('A', 'Serious', 1), record('B', 'Serious', 5), record('C', 'Low', 5)]),
      period([record('A', 'Serious', 9), record('B', 'Serious', 5), record('C', 'Low', 5)]),
    );
    expect(result.rows[0].pValue).toBeCloseTo(22 / 1024, 12);
    expect(result.rows[0].adjustedPValue).toBeCloseTo(66 / 1024, 12);
    expect(result.rows[0].status).toBe('not-significant');
    expect(result.significant).toEqual([]);
  });

  it('does not label missing severity or fractional counts as significant', () => {
    const result = severitySignificance(
      period([record('A', 'Unknown', 1), record('B', 'Low', 1.5)]),
      period([record('A', 'Unknown', 100), record('B', 'Low', 100)]),
    );
    expect(result.testedCount).toBe(0);
    expect(result.rows.every(row => row.status === 'not-assessed')).toBe(true);
    expect(result.significant).toEqual([]);
  });
});
