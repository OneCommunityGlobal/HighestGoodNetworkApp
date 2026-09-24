import { describe, expect, it } from 'vitest';
import { normalizeTaskCompletedStats } from './TaskCompletedBarChart';

describe('TaskCompletedBarChart', () => {
  it('supports assigned/completed alias keys returned by the API', () => {
    const stats = normalizeTaskCompletedStats({
      assigned: {
        current: 12,
        percentage: 0.2,
      },
      completed: {
        current: 9,
        percentage: -0.1,
      },
    });

    expect(stats).toEqual([
      {
        name: 'Assigned',
        amount: 12,
        change: 0.2,
      },
      {
        name: 'Completed',
        amount: 9,
        change: -0.1,
      },
    ]);
  });

  it('supports active/complete keys', () => {
    const stats = normalizeTaskCompletedStats({
      active: {
        current: 25,
        percentage: 10,
      },
      complete: {
        current: 20,
        percentage: 5,
      },
    });

    expect(stats).toEqual([
      {
        name: 'Assigned',
        amount: 25,
        change: 10,
      },
      {
        name: 'Completed',
        amount: 20,
        change: 5,
      },
    ]);
  });

  it('returns zero values when data is missing', () => {
    const stats = normalizeTaskCompletedStats({});

    expect(stats).toEqual([
      {
        name: 'Assigned',
        amount: 0,
        change: 0,
      },
      {
        name: 'Completed',
        amount: 0,
        change: 0,
      },
    ]);
  });
});
