import { pieChartColors, generateArrayOfUniqColors } from '../colorsGenerator';

describe('pieChartColors', () => {
  test('contains the correct number of colors', () => {
    expect(pieChartColors).toHaveLength(8);
  });

  test('contains valid RGB color strings', () => {
    pieChartColors.forEach(color => {
      expect(color).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
    });
  });
});

describe('generateArrayOfUniqColors', () => {
  test('returns an array with the correct number of colors', () => {
    const numberOfColors = 5;
    const result = generateArrayOfUniqColors(numberOfColors);

    expect(result).toHaveLength(numberOfColors);
  });

  test('returns an array with valid RGB color strings', () => {
    const numberOfColors = 3;
    const result = generateArrayOfUniqColors(numberOfColors);

    result.forEach(color => {
      expect(color).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
    });
  });

  test('handles cases where numberOfColors is less than or equal to the length of pieChartColors', () => {
    const numberOfColors = 6;
    const result = generateArrayOfUniqColors(numberOfColors);

    expect(result).toEqual(pieChartColors.slice(0, numberOfColors));
  });

  test('returns additional unique colors when numberOfColors exceeds the length of pieChartColors', () => {
    const numberOfColors = 10;
    const result = generateArrayOfUniqColors(numberOfColors);

    expect(result).toHaveLength(numberOfColors);

    const uniqueSet = new Set(result);
    expect(uniqueSet.size).toBe(numberOfColors);

    result.forEach(color => {
      expect(color).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
    });
  });

  test('returns an empty array when numberOfColors is 0', () => {
    const numberOfColors = 0;
    const result = generateArrayOfUniqColors(numberOfColors);

    expect(result).toEqual([]);
  });
});
