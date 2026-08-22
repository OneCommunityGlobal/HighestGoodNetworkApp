import { buildDonutTooltipOptions, formatLegendLabel } from '../DonutChart';

describe('formatLegendLabel', () => {
  it('matches the Role Distribution key format', () => {
    expect(formatLegendLabel({ label: 'Missing Hours', value: 12 }, 260)).toBe(
      'Missing Hours: 12 (4.6%)',
    );
  });

  it('uses a zero percentage when the total is zero', () => {
    expect(formatLegendLabel({ label: 'Other', value: 0 }, 0)).toBe('Other: 0 (0.0%)');
  });
});

describe('buildDonutTooltipOptions', () => {
  it('formats the hovered category, count, and percentage', () => {
    const tooltip = buildDonutTooltipOptions(260, false);

    expect(tooltip.enabled).toBe(true);
    expect(tooltip.callbacks.title([{ label: 'Missing Hours' }])).toBe('Missing Hours');
    expect(tooltip.callbacks.label({ raw: 12 })).toEqual(['Count: 12', 'Percentage: 4.6%']);
  });

  it('uses a zero percentage when the total is zero', () => {
    const tooltip = buildDonutTooltipOptions(0, false);

    expect(tooltip.callbacks.label({ raw: 0 })).toEqual(['Count: 0', 'Percentage: 0.0%']);
  });

  it('uses theme-appropriate tooltip colors', () => {
    const lightTooltip = buildDonutTooltipOptions(260, false);
    const darkTooltip = buildDonutTooltipOptions(260, true);

    expect(lightTooltip).toMatchObject({
      backgroundColor: '#fff',
      titleColor: '#222',
      bodyColor: '#444',
    });
    expect(darkTooltip).toMatchObject({
      backgroundColor: '#222',
      titleColor: '#fff',
      bodyColor: '#90cdf4',
    });
  });
});
