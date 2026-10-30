import { describe, it, expect } from 'vitest';
import {
  analysisSeries,
  comparePeriods,
  previousRange,
  defaultRange,
  bucketDateRange,
  categoryColorIndex,
} from './injuryAnalysis';

const period = (records, days = 10) => ({ days, buckets: [{ label: 'Jan 2025', records }] });
const record = (workerCategory, count) => ({ workerCategory, count, severity: 'Low' });

describe('injury analysis calculations', () => {
  it('combines severity rows per category and fills missing counts with zero', () => {
    const result = analysisSeries([
      { label: 'Jan', records: [record('Staff', 2), record('Staff', 3)] },
      { label: 'Feb', records: [record('Volunteer', 4)] },
    ]);
    expect(result.series.map(series => series.name)).toEqual(['Staff', 'Volunteer']);
    expect(result.rows[0]).toMatchObject({ category0: 5, category1: 0 });
    expect(result.rows[1]).toMatchObject({ category0: 0, category1: 4 });
  });
  it('handles new, disappearing, stable and declining categories with unequal durations', () => {
    const result = comparePeriods(
      period([record('Staff', 10), record('Stable', 2), record('Gone', 3)], 20),
      period([record('Staff', 7), record('Stable', 2), record('New', 4)], 10),
    );
    expect(result.find(row => row.category === 'Staff')).toMatchObject({
      description: '↓ 3 fewer (30.0%)',
      rateA: 0.5,
      rateB: 0.7,
    });
    expect(result.find(row => row.category === 'Stable').description).toBe('→ Unchanged');
    expect(result.find(row => row.category === 'New').description).toBe('↑ 4 more (new injuries)');
    expect(result.find(row => row.category === 'Gone').description).toBe('↓ 3 fewer (100.0%)');
    expect(comparePeriods(period([]), period([]))).toEqual([]);
  });
  it('defaults to the immediately preceding equal-length period across leap day', () => {
    expect(previousRange('2024-03-01', '2024-03-31')).toEqual({
      start: '2024-01-30',
      end: '2024-02-29',
    });
  });
  it('clips monthly and quarterly tooltip ranges to the exact selected dates', () => {
    expect(
      bucketDateRange({ key: '2024-02', label: 'Feb 2024' }, '2024-02-10', '2024-03-15', 'monthly'),
    ).toBe('2024-02-10 – 2024-02-29');
    expect(
      bucketDateRange(
        { key: '2024-01', label: 'Q1 2024' },
        '2024-02-10',
        '2024-03-15',
        'quarterly',
      ),
    ).toBe('2024-02-10 – 2024-03-15');
  });
  it('uses calendar-month presets through today and stable name-based colors', () => {
    expect(defaultRange(6, new Date(2026, 9, 30))).toEqual({
      start: '2026-05-01',
      end: '2026-10-30',
    });
    expect(defaultRange(12, new Date(2026, 0, 31))).toEqual({
      start: '2025-02-01',
      end: '2026-01-31',
    });
    const index = categoryColorIndex('Volunteer');
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(6);
    expect(categoryColorIndex(['Staff', 'Volunteer'].filter(name => name === 'Volunteer')[0])).toBe(
      index,
    );
  });
});
