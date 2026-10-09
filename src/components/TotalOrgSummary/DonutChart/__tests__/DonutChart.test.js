import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import DonutChart, {
  buildDonutTooltipOptions,
  formatComparison,
  formatLegendLabel,
  formatPercent,
  holeSizePlugin,
} from '../DonutChart';

// Chart.js draws to a <canvas> jsdom doesn't implement; capture the options instead.
let lastDoughnutProps;
vi.mock('react-chartjs-2', () => ({
  Doughnut: props => {
    lastDoughnutProps = props;
    return null;
  },
}));

const renderDonut = comparisonType =>
  render(
    createElement(DonutChart, {
      title: 'TOTAL BLUE SQUARES',
      totalCount: 6385,
      percentageChange: 0,
      data: [{ label: 'Missing Hours', value: 464 }],
      colors: ['#2ec5f5'],
      comparisonType,
    }),
  );

describe('DonutChart center hole', () => {
  it('keeps the default hole when no comparison line is shown', () => {
    renderDonut('No Comparison');
    expect(lastDoughnutProps.options.cutout).toBe('62%');
  });

  it('widens the hole so the comparison line stays inside the ring', () => {
    renderDonut('Week Over Week');
    expect(lastDoughnutProps.options.cutout).toBe('70%');
  });
});

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

describe('DonutChart center title', () => {
  it('splits any "TOTAL ..." title onto two lines so long names stay inside the hole', () => {
    render(
      createElement(DonutChart, {
        title: 'TOTAL VOLUNTEERS*',
        totalCount: 3127,
        percentageChange: 0,
        data: [{ label: 'Existing Active', value: 2049 }],
        colors: ['#4C4AF5'],
        comparisonType: 'No Comparison',
      }),
    );
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('VOLUNTEERS*')).toBeInTheDocument();
  });
});

describe('DonutChart small slices', () => {
  const renderRoles = minLabelPercent =>
    render(
      createElement(DonutChart, {
        title: 'TOTAL MEMBERS',
        totalCount: 2685,
        percentageChange: 0,
        data: [
          { label: 'Volunteer', value: 2654 },
          { label: 'TestRole', value: 30 },
          { label: 'Soham Admin', value: 1 },
        ],
        colors: ['#8ebfff', '#2F80ED', '#56CCF2'],
        comparisonType: 'No Comparison',
        minLabelPercent,
      }),
    );

  it('skips outside labels below minLabelPercent', () => {
    renderRoles(2);
    const { formatter } = lastDoughnutProps.options.plugins.externalLabelGuides;
    expect(formatter({ value: 2654, percentage: 99 })).toEqual(['2654', '(98.8%)']);
    expect(formatter({ value: 30, percentage: 1 })).toBeNull();
  });

  it('keeps slivers too small to draw in the legend', () => {
    renderRoles(0);
    expect(lastDoughnutProps.data.labels).not.toContain('Soham Admin');
    expect(screen.getByText('Soham Admin: 1 (0.0%)')).toBeInTheDocument();
  });
});

const renderSmall = () =>
  render(
    createElement(DonutChart, {
      title: 'TOTAL VOLUNTEERS*',
      totalCount: 2573,
      percentageChange: 0,
      data: [
        { label: 'Existing Active', value: 2565 },
        { label: 'New Active', value: 8 },
      ],
      colors: ['#4C4AF5', '#2CCCF8'],
      comparisonType: 'No Comparison',
    }),
  );

describe('DonutChart review fixes (#5608)', () => {
  it('never rounds a non-zero slice to 0%: label and legend use the same value', () => {
    expect(formatPercent(8, 2573)).toBe('0.3%');
    renderSmall();
    const { formatter } = lastDoughnutProps.options.plugins.externalLabelGuides;
    // the plugin's own whole-number percentage is ignored
    expect(formatter({ value: 8, percentage: 0 })).toEqual(['8', '(0.3%)']);
    expect(screen.getByText('New Active: 8 (0.3%)')).toBeInTheDocument();
  });

  it('shows N/A instead of NaN when the backend sends No Comparison Data', () => {
    expect(formatComparison('No Comparison Data', 'Year Over Year')).toBe('N/A YEAR OVER YEAR');
    expect(formatComparison(null, 'Week Over Week')).toBe('N/A WEEK OVER WEEK');
    expect(formatComparison(Number.NaN, 'Week Over Week')).toBe('N/A WEEK OVER WEEK');
    expect(formatComparison(0.12, 'Week Over Week')).toBe('+12% WEEK OVER WEEK');
    expect(formatComparison(-0.05, 'Month Over Month')).toBe('-5% MONTH OVER MONTH');
  });

  it('shows centerCount in the centre while percentages use the slice total', () => {
    render(
      createElement(DonutChart, {
        title: 'TOTAL HOURS WORKED',
        totalCount: 5,
        centerCount: 1234,
        unitLabel: 'volunteers',
        data: [
          { label: '10-19 hrs', value: 2 },
          { label: '20-29 hrs', value: 3 },
        ],
        colors: ['#00AFF4', '#FFA500'],
        comparisonType: 'No Comparison',
      }),
    );
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('10-19 hrs: 2 volunteers (40.0%)')).toBeInTheDocument();
  });

  it('publishes the hole diameter so the centre text can fit inside the ring', () => {
    const wrapper = document.createElement('div');
    const canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    holeSizePlugin.afterLayout({
      canvas,
      getDatasetMeta: () => ({ data: [{ innerRadius: 53 }] }),
    });
    expect(wrapper.style.getPropertyValue('--donut-hole')).toBe('106px');
  });
});
