import { describe, it, expect } from 'vitest';
import {
  getProjectStatusChangeColor,
  LOWER_IS_BETTER_METRICS,
  PROJECT_STATUS_GOOD_COLOR,
  PROJECT_STATUS_BAD_COLOR,
  PROJECT_STATUS_NEUTRAL_COLOR,
} from '../projectStatusTrend';

describe('getProjectStatusChangeColor', () => {
  it('treats an increase as good and a decrease as bad by default', () => {
    expect(getProjectStatusChangeColor({ percentageChange: 16 })).toBe(PROJECT_STATUS_GOOD_COLOR);
    expect(getProjectStatusChangeColor({ percentageChange: -8 })).toBe(PROJECT_STATUS_BAD_COLOR);
  });

  it('flips the meaning for lower-is-better metrics', () => {
    expect(getProjectStatusChangeColor({ percentageChange: -18 }, true)).toBe(
      PROJECT_STATUS_GOOD_COLOR,
    );
    expect(getProjectStatusChangeColor({ percentageChange: 14 }, true)).toBe(
      PROJECT_STATUS_BAD_COLOR,
    );
  });

  it('keeps the existing neutral and missing-data colors', () => {
    expect(getProjectStatusChangeColor({ percentageChange: 0 }, true)).toBe(
      PROJECT_STATUS_NEUTRAL_COLOR,
    );
    expect(getProjectStatusChangeColor(undefined)).toBe(PROJECT_STATUS_BAD_COLOR);
  });

  it('flags delays, waste and duration as lower-is-better', () => {
    expect(LOWER_IS_BETTER_METRICS.size).toBe(3);
    expect(LOWER_IS_BETTER_METRICS.has('delayedProjects')).toBe(true);
  });
});
