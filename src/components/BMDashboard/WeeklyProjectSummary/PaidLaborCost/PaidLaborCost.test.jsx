import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaidLaborCost from './PaidLaborCost';

const chartCapture = vi.hoisted(() => ({ props: null }));
vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));
vi.mock('react-chartjs-2', () => ({
  Bar: props => {
    chartCapture.props = props;
    return <output aria-label="Chart results">{JSON.stringify(props.data)}</output>;
  },
}));

const records = [
  { task: 'Deployment', project: 'Project A', date: '2026-01-10', cost: 50000, budget: 45000 },
  { task: 'Review', project: 'Project A', date: '2026-02-10', cost: 26000, budget: 24000 },
  { task: 'Deployment', project: 'Project B', date: '2026-02-15', cost: 10000, budget: 9000 },
];

const readChart = () => JSON.parse(screen.getByLabelText('Chart results').textContent);

describe('Paid Labor Cost', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: records }),
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it('recalculates task label rotation when filters change without a browser resize', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    const { options, plugins } = chartCapture.props;
    const chart = { width: 400, options, data: { labels: ['Deployment'] } };
    plugins[0].beforeUpdate(chart);
    expect(options.scales.x.ticks.minRotation).toBe(0);
    chart.data.labels = Array.from({ length: 12 }, (_, i) => `Task ${i}`);
    plugins[0].beforeUpdate(chart);
    expect(options.scales.x.ticks.minRotation).toBe(90);
    expect(options.scales.x.ticks.maxRotation).toBe(90);
    expect(options.scales.x.ticks.autoSkip).toBe(false);
    chart.data.labels = ['Deployment'];
    plugins[0].beforeUpdate(chart);
    expect(options.scales.x.ticks.minRotation).toBe(0);
  });

  it('keeps every task and both series when resizing from wide to narrow and back', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    const { options, data } = chartCapture.props;
    const chart = {
      data: { ...data, labels: Array.from({ length: 12 }, (_, i) => `Task ${i}`) },
      options,
    };
    options.onResize(chart, { width: 400 });
    expect(options.scales.x.ticks.minRotation).toBe(90);
    expect(options.scales.x.ticks.maxRotation).toBe(90);
    expect(options.scales.x.ticks.autoSkip).toBe(false);
    expect(chart.data.labels).toHaveLength(12);
    expect(chart.data.datasets).toHaveLength(2);
    options.onResize(chart, { width: 1600 });
    expect(options.scales.x.ticks.minRotation).toBe(0);
    expect(options.scales.x.ticks.maxRotation).toBe(0);
  });

  it('keeps both values visible vertically when crowded and retains exact tooltips', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    const { plugins, options } = chartCapture.props;
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      measureText: () => ({ width: 45 }),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    };
    const chart = {
      ctx,
      chartArea: { left: 0, right: 400, top: 0, bottom: 300 },
      data: { labels: ['Deployment'], datasets: [{ data: [50000] }, { data: [45000] }] },
      getDatasetMeta: datasetIndex => ({
        data: [{ getProps: () => ({ x: 100 + datasetIndex * 12, y: 100 }) }],
      }),
    };
    plugins[0].afterDatasetsDraw(chart, {}, { darkMode: false });
    expect(ctx.fillText.mock.calls).toEqual([
      ['$50k', 7, 0],
      ['$45k', 7, 0],
    ]);
    expect(ctx.rotate.mock.calls).toEqual([[-Math.PI / 2], [-Math.PI / 2]]);
    expect(
      options.plugins.tooltip.callbacks.label({
        chart: { data: { labels: ['Deployment'] } },
        dataIndex: 0,
        parsed: { y: 50000 },
        dataset: { label: 'Actual' },
      }),
    ).toBe('Deployment, Actual: $50,000');
  });

  it('draws readable pairs above bars with matching angles, formatting and series markers', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    const { plugins, options } = chartCapture.props;
    const colors = [];
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: () => ({ width: 35 }),
      fillText: vi.fn(function() {
        colors.push(this.fillStyle);
      }),
    };
    const chart = {
      ctx,
      chartArea: { left: 0, right: 400, top: 0, bottom: 300 },
      data: {
        labels: ['Deployment'],
        datasets: [
          { data: [50000], backgroundColor: '#2563eb' },
          { data: [45000], backgroundColor: '#d97706' },
        ],
      },
      getDatasetMeta: datasetIndex => ({
        data: [{ getProps: () => ({ x: 100 + datasetIndex * 65, y: 150 }) }],
      }),
    };
    plugins[0].afterDatasetsDraw(chart, {}, { darkMode: false });
    expect(ctx.fillText.mock.calls).toEqual([
      ['$50k', 7, 0],
      ['$45k', 7, 0],
    ]);
    expect(ctx.translate.mock.calls).toEqual([
      [100, 140],
      [165, 140],
    ]);
    expect(ctx.rotate.mock.calls).toEqual([[-Math.PI / 3], [-Math.PI / 3]]);
    expect(colors).toEqual(['#334155', '#334155']);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(options.plugins.legend.align).toBe('center');
  });

  it('groups Actual and Budget by task and preserves totals across projects', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    expect(readChart().labels).toEqual(['Deployment', 'Review']);
    expect(readChart().datasets.map(series => series.label)).toEqual(['Actual', 'Budget']);
    expect(readChart().datasets.map(series => series.data)).toEqual([
      [60000, 26000],
      [54000, 24000],
    ]);
    expect(screen.getByText('86,000.00', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('78,000.00', { exact: false })).toBeInTheDocument();
  });

  it('preserves task multiselection and clearing back to all tasks', async () => {
    const user = userEvent;
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    await user.click(screen.getByLabelText('Tasks'));
    await user.click(screen.getByText('Review'));
    expect(readChart().labels).toEqual(['Review']);
    expect(readChart().datasets[0].data).toEqual([26000]);
    await user.click(screen.getByLabelText('Tasks'));
    await user.click(screen.getByText('Deployment'));
    expect(readChart().labels).toEqual(['Review', 'Deployment']);
    await user.click(screen.getByLabelText('Tasks'));
    await user.click(screen.getByText('Review'));
    await user.click(screen.getByLabelText('Tasks'));
    await user.click(screen.getByText('Deployment'));
    expect(readChart().labels).toEqual(['Deployment', 'Review']);
  });

  it('keeps project filtering and combines it with the inclusive date range', async () => {
    const user = userEvent;
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    await user.click(screen.getByLabelText('Project'));
    await user.click(screen.getByText('Project A'));
    expect(readChart().datasets[0].data).toEqual([50000, 26000]);
    fireEvent.change(screen.getByPlaceholderText('Start Date'), {
      target: { value: '02/10/2026' },
    });
    fireEvent.change(screen.getByPlaceholderText('End Date'), { target: { value: '02/10/2026' } });
    await waitFor(() => expect(readChart().labels).toEqual(['Review']));
    expect(readChart().datasets[0].data).toEqual([26000]);
    fireEvent.change(screen.getByPlaceholderText('End Date'), { target: { value: '03/10/2026' } });
    fireEvent.change(screen.getByPlaceholderText('Start Date'), {
      target: { value: '03/01/2026' },
    });
    expect(
      await screen.findByText('No data available for the selected filters.'),
    ).toBeInTheDocument();
  });
});
