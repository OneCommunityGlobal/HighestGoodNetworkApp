import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaidLaborCost from './PaidLaborCost';

const chartCapture = vi.hoisted(() => ({ props: null, darkMode: false }));
vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: chartCapture.darkMode } }),
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

const colorLuminance = color => {
  let rgb;
  if (color.startsWith('#')) {
    rgb = color.match(/[a-f\d]{2}/gi).map(channel => parseInt(channel, 16) / 255);
  } else {
    const [hue, saturation, lightness] = color.match(/\d+/g).map(Number);
    const l = lightness / 100;
    const a = (saturation / 100) * Math.min(l, 1 - l);
    rgb = [0, 8, 4].map(offset => {
      const k = (offset + hue / 30) % 12;
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    });
  }
  return rgb
    .map(channel => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
};

describe('Paid Labor Cost', () => {
  beforeEach(() => {
    chartCapture.darkMode = false;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: records }),
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it.each([false, true])(
    'aligns the two legend rows with displayed tasks (dark mode: %s)',
    async darkMode => {
      chartCapture.darkMode = darkMode;
      render(<PaidLaborCost />);
      await screen.findByLabelText('Chart results');
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      const legend = screen.getByRole('group', { name: 'Paid labor cost legend' });
      const actual = within(legend).getByRole('list', { name: 'Actual colors' });
      const budget = within(legend).getByRole('list', { name: 'Budget colors' });
      expect(
        within(actual)
          .getAllByRole('listitem')
          .map(item => item.textContent),
      ).toEqual(['', '']);
      expect(
        within(budget)
          .getAllByRole('listitem')
          .map(item => item.textContent),
      ).toEqual(['', '']);
      chartCapture.props.plugins[0].afterLayout({
        width: 500,
        chartArea: { left: 65, right: 480 },
        data: { labels: Array(12).fill('Task') },
      });
      expect(legend).toHaveStyle('--plot-left: 65px; --plot-right: 20px');
      chartCapture.props.plugins[0].afterLayout({
        width: 1500,
        chartArea: { left: 65, right: 1480 },
        data: { labels: ['Deployment', 'Review'] },
      });
      expect(legend).toHaveStyle('--plot-left: 65px; --plot-right: 20px');
      await userEvent.click(screen.getByLabelText('Tasks'));
      await userEvent.click(within(screen.getByRole('listbox')).getByText('Review'));
      expect(within(actual).getAllByRole('listitem')).toHaveLength(1);
      expect(within(actual).getByRole('listitem', { name: 'Review Actual' })).toBeInTheDocument();
      expect(within(budget).getByRole('listitem', { name: 'Review Budget' })).toBeInTheDocument();
      await userEvent.click(screen.getByLabelText('Tasks'));
      await userEvent.click(within(screen.getByRole('listbox')).getByText('Review'));
      expect(within(actual).getAllByRole('listitem')).toHaveLength(2);
    },
  );
  it.each([false, true])(
    'keeps task-specific shade pairs stable through filtering (dark mode: %s)',
    async darkMode => {
      chartCapture.darkMode = darkMode;
      render(<PaidLaborCost />);
      await screen.findByLabelText('Chart results');
      const initial = readChart();
      expect(initial.datasets.map(dataset => dataset.borderWidth)).toEqual(
        darkMode ? [1, 1] : [0, 0],
      );
      const actual = initial.datasets[0].backgroundColor;
      const budget = initial.datasets[1].backgroundColor;
      const background = colorLuminance(darkMode ? '#2b3e50' : '#ffffff');
      initial.datasets[0].borderColor.forEach(color => {
        const outline = colorLuminance(color);
        const contrast =
          (Math.max(outline, background) + 0.05) / (Math.min(outline, background) + 0.05);
        expect(contrast).toBeGreaterThanOrEqual(3);
      });
      expect(new Set(actual).size).toBe(2);
      actual.forEach((color, index) => {
        const actualParts = color.match(/\d+/g).map(Number);
        const budgetParts = budget[index].match(/\d+/g).map(Number);
        expect(actualParts.slice(0, 2)).toEqual(budgetParts.slice(0, 2));
        expect(actualParts[2]).toBeLessThan(budgetParts[2]);
      });
      await userEvent.click(screen.getByLabelText('Tasks'));
      await userEvent.click(within(screen.getByRole('listbox')).getByText('Review'));
      expect(readChart().datasets[0].backgroundColor).toEqual([actual[1]]);
      expect(readChart().datasets[1].backgroundColor).toEqual([budget[1]]);
      expect(chartCapture.props.options.plugins.barValueLabelPlugin.darkMode).toBe(darkMode);
    },
  );

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
      stroke: vi.fn(),
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
    ).toContain('Actual: $50,000.00');
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
      stroke: vi.fn(),
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
    expect(options.plugins.legend.display).toBe(false);
  });

  it.each([false, true])(
    'matches each marker to its task shade with readable value text (dark mode: %s)',
    async darkMode => {
      chartCapture.darkMode = darkMode;
      render(<PaidLaborCost />);
      await screen.findByLabelText('Chart results');
      const { plugins, data } = chartCapture.props;
      const fills = [];
      const textColors = [];
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        stroke: vi.fn(),
        measureText: () => ({ width: 35 }),
        fill: vi.fn(function() {
          fills.push(this.fillStyle);
        }),
        fillText: vi.fn(function() {
          textColors.push(this.fillStyle);
        }),
      };
      plugins[0].afterDatasetsDraw(
        {
          ctx,
          data,
          chartArea: { left: 0, right: 600, top: 0, bottom: 300 },
          getDatasetMeta: datasetIndex => ({
            data: data.labels.map((_, index) => ({
              getProps: () => ({ x: 100 + index * 200 + datasetIndex * 50, y: 150 }),
            })),
          }),
        },
        {},
        { darkMode },
      );
      expect(fills).toEqual(
        data.labels.flatMap((_, index) =>
          data.datasets.map(dataset => dataset.backgroundColor[index]),
        ),
      );
      const text = colorLuminance(textColors[0]);
      const background = colorLuminance(darkMode ? '#2b3e50' : '#ffffff');
      expect(
        (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05),
      ).toBeGreaterThanOrEqual(4.5);
      expect(new Set(textColors).size).toBe(1);
    },
  );

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
    await user.click(within(screen.getByRole('listbox')).getByText('Review'));
    expect(readChart().labels).toEqual(['Review']);
    expect(readChart().datasets[0].data).toEqual([26000]);
    await user.click(screen.getByLabelText('Tasks'));
    await user.click(within(screen.getByRole('listbox')).getByText('Deployment'));
    expect(readChart().labels).toEqual(['Deployment', 'Review']);
    await user.click(screen.getByLabelText('Tasks'));
    await user.click(within(screen.getByRole('listbox')).getByText('Review'));
    await user.click(screen.getByLabelText('Tasks'));
    await user.click(within(screen.getByRole('listbox')).getByText('Deployment'));
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

  it('sorts tasks by actual cost while preserving task colors and percentages', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    const original = readChart();
    const contributions = screen.getByRole('list', { name: 'Task cost contributions' });
    expect(within(contributions).getAllByRole('listitem')[0]).toHaveTextContent('Deployment');
    expect(within(contributions).getAllByRole('listitem')[0]).toHaveTextContent('69.8%');
    expect(within(contributions).getAllByRole('listitem')[1]).toHaveTextContent('30.2%');
    fireEvent.change(screen.getByLabelText('Sort tasks by cost'), { target: { value: 'lowest' } });
    expect(readChart().labels).toEqual(['Review', 'Deployment']);
    expect(readChart().datasets[0].data).toEqual([26000, 60000]);
    expect(readChart().datasets[0].backgroundColor).toEqual(
      [...original.datasets[0].backgroundColor].reverse(),
    );
    expect(within(contributions).getAllByRole('listitem')[0]).toHaveTextContent('Review');
  });

  it('switches to aggregate totals and drills down from Total Actual without losing filters', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    await userEvent.click(screen.getByLabelText('Project'));
    await userEvent.click(screen.getByText('Project A'));
    await userEvent.click(screen.getByRole('button', { name: 'Aggregate', exact: true }));
    expect(readChart().labels).toEqual(['Project A']);
    expect(readChart().datasets.map(dataset => dataset.data)).toEqual([[76000], [69000]]);
    expect(screen.queryByLabelText('Sort tasks by cost')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'View task breakdown of Total Actual' }),
    );
    expect(readChart().datasets[0].data).toEqual([50000, 26000]);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Task contributions' })).toHaveFocus(),
    );
    expect(screen.getByRole('button', { name: 'Tasks', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('drills down from an aggregate chart bar', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    await userEvent.click(screen.getByRole('button', { name: 'Aggregate', exact: true }));
    fireEvent.click(screen.getByLabelText('Chart results'));
    chartCapture.props.options.onClick({}, [{ index: 0 }]);
    await waitFor(() => expect(readChart().labels).toEqual(['Deployment', 'Review']));
  });

  it('uses updated filtered totals in tooltips and explicitly marks missing hours and rates', async () => {
    render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    await userEvent.click(screen.getByLabelText('Tasks'));
    await userEvent.click(within(screen.getByRole('listbox')).getByText('Review'));
    const { data, options } = chartCapture.props;
    const actual = options.plugins.tooltip.callbacks.label({
      chart: { data },
      dataIndex: 0,
      parsed: { y: 26000 },
      dataset: data.datasets[0],
    });
    expect(actual).toContain('100.0% of filtered actual labor cost');
    expect(actual).toContain('Hours worked: Unavailable');
    expect(actual).toContain('Hourly rate: Unavailable');
    const budget = options.plugins.tooltip.callbacks.label({
      chart: { data },
      dataIndex: 0,
      parsed: { y: 24000 },
      dataset: data.datasets[1],
    });
    expect(budget).toContain('100.0% of filtered budget');
  });

  it('handles zero costs and empty results without offering an empty drill-down', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ ...records[0], cost: 0, budget: 0 }] }),
    });
    const { unmount } = render(<PaidLaborCost />);
    await screen.findByLabelText('Chart results');
    expect(
      within(screen.getByRole('list', { name: 'Task cost contributions' })).getAllByText(
        'Unavailable',
      )[0],
    ).toBeInTheDocument();
    unmount();
    fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    render(<PaidLaborCost />);
    await screen.findByText('No data available for the selected filters.');
    expect(
      screen.getByRole('button', { name: 'View task breakdown of Total Actual' }),
    ).toBeDisabled();
  });
});
