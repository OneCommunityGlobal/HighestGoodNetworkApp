import { buildLaborCostTooltip, getCostPercentage } from './laborCostTooltip';

const context = (cost, costType = 'actual') => ({
  chart: { data: { labels: ['Project Alpha'] } },
  dataIndex: 0,
  parsed: { y: cost },
  dataset: { label: `Deployment (${costType})`, costType },
});

describe('labor cost contribution tooltips', () => {
  it('uses the filtered actual total and updates when that total changes', () => {
    expect(buildLaborCostTooltip(context(250), 1000, 500)).toContain(
      '25.0% of filtered actual labor cost',
    );
    expect(buildLaborCostTooltip(context(250), 500, 500)).toContain(
      '50.0% of filtered actual labor cost',
    );
  });

  it('compares budget bars with the budget total', () => {
    expect(buildLaborCostTooltip(context(250, 'budget'), 1000, 500)).toContain(
      '50.0% of filtered budget',
    );
  });

  it.each([0, undefined, NaN, Infinity])('handles an unavailable total: %s', total => {
    expect(getCostPercentage(250, total)).toBe(0);
    expect(buildLaborCostTooltip(context(250), total, 0).join(' ')).toContain('Share unavailable');
  });

  it('keeps small contributions visible', () => {
    expect(buildLaborCostTooltip(context(1), 10000, 0)).toContain(
      '<0.1% of filtered actual labor cost',
    );
  });

  it('formats dollars without multiplying them by 1000', () => {
    expect(buildLaborCostTooltip(context(250), 1000, 0)[0]).toBe('Actual: $250.00');
    expect(buildLaborCostTooltip(context(250, 'budget'), 1000, 500)[0]).toBe('Budget: $250.00');
  });
});
