import { render, screen } from '@testing-library/react';
import DonutChart, { DONUT_CHART_HEIGHT, DONUT_CHART_MIN_WIDTH } from '../DonutChart';

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <canvas data-testid="donut-canvas" />,
}));

const sampleData = [
  { label: 'Missing Hours', value: 132 },
  { label: 'Missing Summary', value: 118 },
  { label: 'Missing Both Hours & Summary', value: 156 },
  { label: 'Vacation Time', value: 89 },
  { label: 'Other', value: 52 },
];
const sampleColors = ['#2CCCF8', '#3D91DC', '#4C4AF5', '#FF62EB', '#F59E0B'];

const renderChart = (props = {}) =>
  render(
    <DonutChart
      title="TOTAL BLUE SQUARES"
      totalCount={547}
      percentageChange={0}
      data={sampleData}
      colors={sampleColors}
      comparisonType="No Comparison"
      darkMode={false}
      {...props}
    />,
  );

describe('DonutChart render', () => {
  it('renders a canvas with Role Distribution chart size constants', () => {
    renderChart();

    expect(DONUT_CHART_HEIGHT).toBe(430);
    expect(DONUT_CHART_MIN_WIDTH).toBe(500);
    expect(screen.getByTestId('donut-canvas')).toBeInTheDocument();
  });

  it('shows all five categories in the legend', () => {
    renderChart();

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Missing Hours: 132 (24.1%)')).toBeInTheDocument();
    expect(screen.getByText('Other: 52 (9.5%)')).toBeInTheDocument();
    expect(screen.getByText('547')).toBeInTheDocument();
  });

  it('includes zero-value categories in the legend', () => {
    renderChart({
      data: [
        { label: 'Missing Hours', value: 100 },
        { label: 'Other', value: 0 },
      ],
      colors: ['#2CCCF8', '#F59E0B'],
      totalCount: 100,
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Missing Hours: 100 (100.0%)')).toBeInTheDocument();
    expect(screen.getByText('Other: 0 (0.0%)')).toBeInTheDocument();
  });

  it('renders center labels in dark mode', () => {
    renderChart({ darkMode: true });

    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('BLUE SQUARES')).toBeInTheDocument();
    expect(screen.getByText('547')).toBeInTheDocument();
  });

  it('falls back to category sum when backend total is stale', () => {
    renderChart({ totalCount: 0 });

    expect(screen.getByText('547')).toBeInTheDocument();
  });
});
