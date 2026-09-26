import {
  buildDonutTooltipOptions,
  buildExternalLabelGuidesOptions,
  buildChartItems,
  CENTER_SIZE_PX,
  DONUT_CHART_HEIGHT,
  DONUT_CHART_MIN_WIDTH,
  formatCalloutLines,
  formatLegendLabel,
  resolveDisplayTotalCount,
} from '../DonutChart';

describe('formatLegendLabel', () => {
  it('formats as "Label: count (pct%)"', () => {
    expect(formatLegendLabel({ label: 'Missing Hours', value: 12 }, 260)).toBe(
      'Missing Hours: 12 (4.6%)',
    );
  });

  it('uses 0.0% when total is zero', () => {
    expect(formatLegendLabel({ label: 'Other', value: 0 }, 0)).toBe('Other: 0 (0.0%)');
  });
});

describe('formatCalloutLines', () => {
  it('returns two lines: count and percentage', () => {
    expect(formatCalloutLines(12, 260)).toEqual(['12', '(4.6%)']);
    expect(formatCalloutLines(24, 33)).toEqual(['24', '(72.7%)']);
  });

  it('uses 0.0% when total is zero', () => {
    expect(formatCalloutLines(0, 0)).toEqual(['0', '(0.0%)']);
  });
});

describe('chart size constants', () => {
  it('matches Role Distribution footprint', () => {
    expect(DONUT_CHART_HEIGHT).toBe(430);
    expect(DONUT_CHART_MIN_WIDTH).toBe(500);
  });

  it('center overlay fits inside the donut hole', () => {
    // Hole diameter ≈ 155 px (cutout 50%, outer radius ~155px).
    expect(CENTER_SIZE_PX).toBeLessThan(155);
  });
});

describe('buildExternalLabelGuidesOptions', () => {
  it('uses outside placement with transparent label background', () => {
    const opts = buildExternalLabelGuidesOptions(547, false);

    expect(opts.placement).toBe('outside');
    expect(opts.hideOverlappingLabels).toBe(true);
    expect(opts.backgroundColor).toBe('transparent');
    expect(opts.borderWidth).toBe(0);
    expect(opts.formatter({ value: 132 })).toEqual(['132', '(24.1%)']);
  });
});

describe('resolveDisplayTotalCount', () => {
  it('prefers the sum of category values over a stale backend total', () => {
    expect(resolveDisplayTotalCount(0, [{ value: 0 }, { value: 4 }])).toBe(4);
  });
});

describe('buildChartItems', () => {
  it('filters out zero-value categories', () => {
    const data = [
      { label: 'Missing Hours', value: 0 },
      { label: 'Other', value: 4 },
    ];
    expect(buildChartItems(data, ['#2CCCF8', '#F59E0B'])).toEqual([
      { label: 'Other', value: 4, color: '#F59E0B' },
    ]);
  });
});

describe('buildDonutTooltipOptions', () => {
  it('returns a disabled tooltip with correct callbacks', () => {
    const tt = buildDonutTooltipOptions(260, false);

    expect(tt.enabled).toBe(false);
    expect(tt.callbacks.title([{ label: 'Missing Hours' }])).toBe('Missing Hours');
    expect(tt.callbacks.label({ raw: 12 })).toEqual(['Count: 12', 'Percentage: 4.6%']);
  });

  it('uses dark-mode colors when darkMode is true', () => {
    expect(buildDonutTooltipOptions(260, true)).toMatchObject({
      backgroundColor: '#222',
      titleColor: '#fff',
      bodyColor: '#90cdf4',
    });
  });
});
