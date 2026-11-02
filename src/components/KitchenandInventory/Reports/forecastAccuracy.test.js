import { describe, it, expect } from 'vitest';
import { calculateAccuracy, prepareForecastReport, forecastReportCSV } from './forecastAccuracy';
import demoReport from './forecastAccuracy.mock.json';

describe('forecast accuracy calculations', () => {
  it.each([
    [50, 48, 96],
    [50, 52, 96],
    [8, 8, 100],
    [20, 17, 85],
    [10, 0, 0],
    [10, 25, 0],
    [0, 0, 100],
    [0, 4, 0],
  ])('calculates planned %s vs actual %s as %s%%', (planned, actual, expected) => {
    expect(calculateAccuracy(planned, actual)).toBeCloseTo(expected);
  });

  it('preserves supplied demo overrides without changing the input JSON', () => {
    const original = JSON.stringify(demoReport);
    const result = prepareForecastReport(demoReport);
    expect(result.ingredients.map(item => item.accuracyPercent)).toEqual([96, 88, 100, 85, 93]);
    expect(result.averageAccuracyPercent).toBe(92.4);
    expect(result.isDemo).toBe(true);
    expect(JSON.stringify(demoReport)).toBe(original);
  });

  it('calculates from quantities when demo overrides are absent', () => {
    const result = prepareForecastReport({
      isDemo: true,
      ingredients: [{ id: 'carrots', name: 'Carrots', plannedLbs: 35, actualLbs: 40 }],
    });
    expect(result.ingredients[0].accuracyPercent).toBe(86);
    expect(result.averageAccuracyPercent).toBe(85.7);
  });

  it.each([false, undefined])('ignores demo overrides when isDemo is %s', isDemo => {
    const result = prepareForecastReport({ ...demoReport, isDemo });
    expect(result.ingredients[1].accuracyPercent).toBe(86);
    expect(result.averageAccuracyPercent).toBe(92);
    expect(result.isDemo).toBe(false);
  });

  it('preserves explicit zero demo accuracy rather than falling back to a calculation', () => {
    const result = prepareForecastReport({
      isDemo: true,
      demoAverageAccuracyPercent: 0,
      ingredients: [
        { id: 'rice', name: 'Rice', plannedLbs: 10, actualLbs: 10, demoAccuracyPercent: 0 },
      ],
    });
    expect(result.ingredients[0].accuracyPercent).toBe(0);
    expect(result.averageAccuracyPercent).toBe(0);
  });

  it('averages full precision before rounding the overall percentage', () => {
    const result = prepareForecastReport({
      ingredients: [
        { id: 'a', name: 'Rice', plannedLbs: 3, actualLbs: 2 },
        { id: 'b', name: 'Milk', plannedLbs: 7, actualLbs: 6 },
      ],
    });
    expect(result.ingredients.map(item => item.accuracyPercent)).toEqual([67, 86]);
    expect(result.averageAccuracyPercent).toBe(76.2);
  });

  it('handles an empty response without NaN', () => {
    expect(prepareForecastReport({ ingredients: [] })).toEqual({
      ingredients: [],
      averageAccuracyPercent: 0,
      isDemo: false,
    });
  });
});

describe('forecast CSV serialization', () => {
  it('includes all displayed mock records and column headings', () => {
    const csv = forecastReportCSV(prepareForecastReport(demoReport).ingredients);
    expect(csv.split('\r\n')).toEqual([
      '"Ingredient","Planned (lbs)","Actual (lbs)","Accuracy (%)"',
      '"Tomatoes","50","48","96"',
      '"Carrots","35","40","88"',
      '"Olive Oil","8","8","100"',
      '"Quinoa","20","17","85"',
      '"Milk","15","14","93"',
    ]);
  });

  it('quotes ingredient names containing commas, quotes, or newlines', () => {
    expect(
      forecastReportCSV([
        { name: 'Rice, "brown"\norganic', plannedLbs: 1, actualLbs: 1, accuracyPercent: 100 },
      ]),
    ).toContain('"Rice, ""brown""\norganic","1","1","100"');
  });

  it('exports column headings for an empty report', () => {
    expect(forecastReportCSV([])).toBe(
      '"Ingredient","Planned (lbs)","Actual (lbs)","Accuracy (%)"',
    );
  });
});
