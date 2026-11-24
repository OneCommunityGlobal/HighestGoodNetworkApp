import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import FoodSourcesPieChart, {
  SOURCES,
  getRecentMonths,
  buildMockRecords,
  buildSourceData,
  toWholePercents,
} from '../FoodSourcesPieChart';
import { formatMonth } from '../../KIPieChartCard/KIPieChartCard';

vi.mock('recharts', () => import('../../testUtils/rechartsMock'));

const mockStore = configureMockStore([]);

const renderChart = (darkMode = false) =>
  render(
    <Provider store={mockStore({ theme: { darkMode } })}>
      <FoodSourcesPieChart />
    </Provider>,
  );

const records = [
  { kitchen: 'Kitchen 1', month: '2026-01', source: 'grown', kg: 60 },
  { kitchen: 'Kitchen 1', month: '2026-01', source: 'purchased', kg: 30 },
  { kitchen: 'Kitchen 1', month: '2026-02', source: 'preserved', kg: 10 },
  { kitchen: 'Kitchen 2', month: '2026-02', source: 'grown', kg: 100 },
];

describe('Food Sources helpers', () => {
  it('gives the last 12 months up to the given month', () => {
    const months = getRecentMonths(new Date(2026, 10, 16));
    expect(months).toHaveLength(12);
    expect(months[0]).toBe('2025-12');
    expect(months.at(-1)).toBe('2026-11');
  });

  it('makes one record per kitchen, month and source', () => {
    const mock = buildMockRecords(['2026-10', '2026-11']);
    expect(mock).toHaveLength(3 * 2 * SOURCES.length);
    expect(mock.every(r => r.kg > 0)).toBe(true);
  });

  it('adds up every kitchen by default, with percentages', () => {
    const data = buildSourceData(records);
    expect(data.map(d => [d.name, d.value, d.percent])).toEqual([
      ['Freshly Grown', 160, 80],
      ['Purchased', 30, 15],
      ['Preserved', 10, 5],
    ]);
  });

  it('makes the percentages add up to exactly 100', () => {
    expect(toWholePercents([1, 1, 1], 3)).toEqual([34, 33, 33]);
    expect(toWholePercents([445, 355, 200], 1000)).toEqual([45, 35, 20]);
    const data = buildSourceData(buildMockRecords(getRecentMonths()));
    expect(data.reduce((s, d) => s + d.percent, 0)).toBe(100);
  });

  it('keeps only the chosen kitchen', () => {
    const data = buildSourceData(records, { kitchen: 'Kitchen 1' });
    expect(data.map(d => d.value)).toEqual([60, 30, 10]);
  });

  it('keeps only the months inside the From and To months', () => {
    const data = buildSourceData(records, { startDate: '2026-02', endDate: '2026-02' });
    expect(data.map(d => d.value)).toEqual([100, 0, 10]);
  });

  it('returns nothing when From is after To or nothing matches', () => {
    expect(buildSourceData(records, { startDate: '2026-03', endDate: '2026-01' })).toEqual([]);
    expect(buildSourceData(records, { kitchen: 'Kitchen 3' })).toEqual([]);
  });
});

describe('Food Sources chart', () => {
  it('shows the title, the three sources and the legend with percentages', () => {
    renderChart();
    expect(screen.getByRole('heading', { name: 'Food Sources' })).toBeInTheDocument();
    const slices = screen.getByTestId('pie-slices');
    SOURCES.forEach(s => expect(slices).toHaveTextContent(s.name));
    expect(screen.getAllByText(/^[A-Za-z ]+ \(\d+%\)$/)).toHaveLength(3);
    expect(screen.getByTestId('tooltip')).toHaveTextContent('1,200 kg (10%)');
  });

  it('changes the slices when a kitchen is picked and resets back', () => {
    renderChart();
    const allSlices = screen.getByTestId('pie-slices').textContent;
    const reset = screen.getByRole('button', { name: 'Reset Filters' });
    expect(reset).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Kitchen'), { target: { value: 'Kitchen 2' } });
    expect(screen.getByTestId('pie-slices').textContent).not.toBe(allSlices);
    expect(reset).toBeEnabled();

    fireEvent.click(reset);
    expect(screen.getByTestId('pie-slices').textContent).toBe(allSlices);
  });

  it('shows an error and no chart when From is after To', () => {
    renderChart();
    const from = screen.getByLabelText('From');
    const to = screen.getByLabelText('To');
    const months = getRecentMonths();
    fireEvent.change(from, { target: { value: months.at(-1) } });
    fireEvent.change(to, { target: { value: months[0] } });
    expect(screen.getByText('From month must be before or equal to To month.')).toBeInTheDocument();
    expect(screen.getByText('No data available for the selected filters.')).toBeInTheDocument();
  });

  it('picks whole months only, so a one month range shows just that month', () => {
    renderChart();
    const months = getRecentMonths();
    const from = screen.getByLabelText('From');
    expect(from.tagName).toBe('SELECT');
    expect([...from.options].map(o => o.value)).toEqual(['', ...months]);
    expect(from.options[1]).toHaveTextContent(formatMonth(months[0]));

    const allSlices = screen.getByTestId('pie-slices').textContent;
    const lastMonth = months.at(-1);
    fireEvent.change(from, { target: { value: lastMonth } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: lastMonth } });

    const oneMonth = buildSourceData(buildMockRecords(months), {
      startDate: lastMonth,
      endDate: lastMonth,
    });
    expect(screen.getByTestId('pie-slices').textContent).not.toBe(allSlices);
    oneMonth.forEach(d =>
      expect(screen.getByText(`${d.name} (${d.percent}%)`)).toBeInTheDocument(),
    );
  });

  it('shows month labels like Nov 2026', () => {
    expect(formatMonth('2026-11')).toBe('Nov 2026');
    expect(formatMonth('2025-01')).toBe('Jan 2025');
  });

  it('renders in dark mode', () => {
    renderChart(true);
    expect(screen.getByRole('heading', { name: 'Food Sources' })).toBeInTheDocument();
  });
});
