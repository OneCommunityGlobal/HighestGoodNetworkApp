import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import SeasonalTrendsLineChart, {
  SERIES,
  Marker,
  buildMockRecords,
  buildTrendData,
  formatMonth,
} from '../SeasonalTrendsLineChart';
import { getRecentMonths } from '../../KIChartFilters/KIChartFilters';

vi.mock('recharts', () => import('../../testUtils/rechartsMock'));

const monthLabels = () => within(screen.getByTestId('line-points')).getAllByRole('listitem');

const renderChart = (darkMode = false) =>
  render(
    <Provider store={configureMockStore([])({ theme: { darkMode } })}>
      <SeasonalTrendsLineChart />
    </Provider>,
  );

const records = [
  { kitchen: 'Kitchen 1', month: '2026-02', category: 'produce', harvest: 10, wastage: 1 },
  { kitchen: 'Kitchen 2', month: '2026-02', category: 'produce', harvest: 5, wastage: 2 },
  { kitchen: 'Kitchen 1', month: '2026-01', category: 'grains', harvest: 7, wastage: 3 },
  { kitchen: 'Kitchen 1', month: '2026-03', category: 'dairy', harvest: 4, wastage: 0 },
];
const ALL = { metric: 'harvest', kitchen: 'All', startDate: '', endDate: '' };

describe('Seasonal Trends helpers', () => {
  it('labels months with a short name and year', () => {
    expect(formatMonth('2026-01')).toBe("Jan '26");
    expect(formatMonth('2025-12')).toBe("Dec '25");
  });

  it('makes one record per kitchen, month and category, peaking in late summer', () => {
    const mock = buildMockRecords(['2026-02', '2026-08']);
    expect(mock).toHaveLength(3 * 2 * SERIES.length);
    const produce = month =>
      mock.find(r => r.kitchen === 'Kitchen 1' && r.month === month && r.category === 'produce');
    expect(produce('2026-08').harvest).toBeGreaterThan(produce('2026-02').harvest);
    expect(mock.every(r => r.inventory > 0 && r.wastage > 0)).toBe(true);
  });

  it('adds up every kitchen per month, in month order', () => {
    expect(buildTrendData(records, ALL)).toEqual([
      { month: '2026-01', label: "Jan '26", grains: 7 },
      { month: '2026-02', label: "Feb '26", produce: 15 },
      { month: '2026-03', label: "Mar '26", dairy: 4 },
    ]);
  });

  it('uses the chosen metric and kitchen', () => {
    const data = buildTrendData(records, { ...ALL, metric: 'wastage', kitchen: 'Kitchen 2' });
    expect(data).toEqual([{ month: '2026-02', label: "Feb '26", produce: 2 }]);
  });

  it('keeps only the months inside the dates, and nothing when they are reversed', () => {
    const inRange = { ...ALL, startDate: '2026-02-01', endDate: '2026-03-31' };
    expect(buildTrendData(records, inRange).map(d => d.month)).toEqual(['2026-02', '2026-03']);
    const reversed = { ...ALL, startDate: '2026-03-01', endDate: '2026-01-01' };
    expect(buildTrendData(records, reversed)).toEqual([]);
  });

  it('draws nothing for a point without a position', () => {
    render(
      <svg>
        <Marker shape="circle" color="#000" />
      </svg>,
    );
    expect(screen.queryByTestId('marker-circle')).not.toBeInTheDocument();
  });
});

describe('Seasonal Trends chart', () => {
  it('shows twelve months, the four category lines and the legend', () => {
    renderChart();
    expect(
      screen.getByRole('heading', { name: 'Seasonal Trends: Harvest Yield' }),
    ).toBeInTheDocument();
    const months = getRecentMonths();
    expect(monthLabels()).toHaveLength(12);
    expect(screen.getByTestId('line-points')).toHaveTextContent(formatMonth(months.at(-1)));
    ['Fresh Produce', 'Grains', 'Proteins', 'Dairy'].forEach(name => {
      expect(screen.getByLabelText(name)).toBeInTheDocument();
      expect(screen.getByText(name)).toBeInTheDocument();
    });
    expect(screen.getByTestId('y-axis')).toHaveTextContent('Harvest Yield (kg)');
    expect(screen.getByTestId('tooltip')).toHaveTextContent('1,200 kg');
    const shapes = { produce: 'circle', grains: 'square', proteins: 'triangle', dairy: 'diamond' };
    Object.entries(shapes).forEach(([key, shape]) => {
      const line = within(screen.getByTestId(`line-${key}`));
      expect(line.getByTestId(`marker-${shape}`)).toBeInTheDocument();
    });
  });

  it('changes the title and axis with the metric, and resets back', () => {
    renderChart(true);
    const reset = screen.getByRole('button', { name: 'Reset Filters' });
    expect(reset).toBeDisabled();

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'wastage' } });
    expect(screen.getByRole('heading', { name: 'Seasonal Trends: Wastage' })).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toHaveTextContent('Wastage (kg)');

    fireEvent.click(reset);
    expect(
      screen.getByRole('heading', { name: 'Seasonal Trends: Harvest Yield' }),
    ).toBeInTheDocument();
  });

  it('shows only the months between From and To', () => {
    renderChart();
    const months = getRecentMonths();
    fireEvent.change(screen.getByLabelText('From'), { target: { value: `${months[9]}-01` } });
    expect(monthLabels()).toHaveLength(3);
  });

  it('shows an error and no chart when From is after To', () => {
    renderChart();
    const months = getRecentMonths();
    fireEvent.change(screen.getByLabelText('From'), { target: { value: `${months.at(-1)}-01` } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: `${months[0]}-01` } });
    expect(screen.getByText('From date must be before or equal to To date.')).toBeInTheDocument();
    expect(screen.getByText('No data available for the selected filters.')).toBeInTheDocument();
  });
});
