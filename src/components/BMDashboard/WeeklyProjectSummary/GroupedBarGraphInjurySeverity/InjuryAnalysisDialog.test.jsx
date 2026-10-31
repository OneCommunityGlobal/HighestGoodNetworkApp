import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import InjuryAnalysisDialog from './InjuryAnalysisDialog';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>Timeline chart{children}</div>,
  BarChart: () => <div>Comparison chart</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  CartesianGrid: () => null,
  Text: () => null,
  ReferenceLine: ({ x }) => <span data-testid="safety-event-line" data-time={x} />,
}));
const data = {
  days: 31,
  buckets: [
    {
      key: '2025-01',
      label: 'Jan 2025',
      records: [{ workerCategory: 'Staff', severity: 'Low', count: 3 }],
    },
  ],
};
const makeFilters = (value = []) => [
  {
    id: 'projects',
    label: 'Projects',
    options: [{ value: '65419e61105441587e2dec99', label: 'Analysis project' }],
    value,
    onChange: vi.fn(),
  },
  { id: 'severities', label: 'Severities', options: [], value: [], onChange: vi.fn() },
  { id: 'types', label: 'Injury types', options: [], value: [], onChange: vi.fn() },
];
const props = () => ({
  onClose: vi.fn(),
  initialRange: { start: '2025-01-01', end: '2025-01-31' },
  filters: makeFilters(),
});

beforeEach(() => {
  axios.get.mockReset();
  axios.get.mockResolvedValue({ data });
});

describe('injury analysis dialog', () => {
  it('adds exact-date markers without requests or persistence and clears them when closed', async () => {
    const save = vi.fn();
    const initial = props();
    const { unmount } = render(<InjuryAnalysisDialog {...initial} onSettingsChange={save} />);
    await screen.findByText('Timeline chart');
    const requests = axios.get.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Safety events' }));
    fireEvent.change(screen.getByLabelText('Event name'), { target: { value: 'Safety training' } });
    fireEvent.change(screen.getByLabelText('Event date'), { target: { value: '2025-01-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add marker' }));
    expect(await screen.findByTestId('safety-event-line')).toHaveAttribute(
      'data-time',
      String(Date.parse('2025-01-10T00:00:00Z')),
    );
    expect(axios.get.mock.calls).toHaveLength(requests);
    const settings = save.mock.lastCall[0];
    expect(settings.events).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Hide markers' }));
    expect(screen.queryByTestId('safety-event-line')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show markers' }));
    expect(screen.getByTestId('safety-event-line')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Group by'), { target: { value: 'quarterly' } });
    await screen.findByTestId('safety-event-line');
    unmount();
    render(<InjuryAnalysisDialog {...initial} initialSettings={settings} />);
    await screen.findByText('Timeline chart');
    expect(screen.queryByTestId('safety-event-line')).toBeNull();
    expect(screen.getByRole('button', { name: 'Safety events' })).toBeTruthy();
  });

  it('exposes a clear chart/data toggle without the instructional paragraphs', async () => {
    render(<InjuryAnalysisDialog {...props()} />);
    await screen.findByText('Timeline chart');
    fireEvent.click(screen.getByRole('button', { name: 'View data' }));
    expect(
      screen.getByRole('table', { name: 'Recorded injuries by period and worker category' }),
    ).toBeVisible();
    expect(screen.queryByText('Timeline chart')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'View chart' }));
    expect(screen.getByText('Timeline chart')).toBeTruthy();
    expect(
      screen.queryByText(/Filters are shared|Presets include|keep the timeline readable/),
    ).toBeNull();
    expect(screen.getByRole('option', { name: 'Last 3 months' })).toBeTruthy();
  });
  it('loads a timeline, changes grouping, and isolates analysis filters from the snapshot', async () => {
    const initial = props();
    render(<InjuryAnalysisDialog {...initial} />);
    await screen.findByText('Timeline chart');
    expect(axios.get.mock.calls[0][1].params).toMatchObject({
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      interval: 'monthly',
    });
    fireEvent.change(screen.getByLabelText('Group by'), { target: { value: 'quarterly' } });
    await waitFor(() => expect(axios.get.mock.lastCall[1].params.interval).toBe('quarterly'));
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'ArrowDown', keyCode: 40 });
    fireEvent.click(screen.getByText('Analysis project'));
    await waitFor(() =>
      expect(axios.get.mock.lastCall[1].params.projectIds).toBe('65419e61105441587e2dec99'),
    );
    expect(initial.filters[0].onChange).not.toHaveBeenCalled();
    expect(initial.filters[0].value).toEqual([]);
  });
  it('compares two periods and rejects overlapping dates without loading them', async () => {
    render(<InjuryAnalysisDialog {...props()} />);
    await screen.findByText('Timeline chart');
    fireEvent.click(screen.getByRole('button', { name: 'Compare periods' }));
    await screen.findByText('Comparison chart');
    expect(screen.getByText('→ Unchanged')).toBeTruthy();
    const previousCalls = axios.get.mock.calls.length;
    fireEvent.change(screen.getAllByLabelText('End date')[0], { target: { value: '2025-01-10' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('non-overlapping');
    expect(axios.get.mock.calls.length).toBe(previousCalls);
  });
  it('shows empty and error states without retaining the old chart', async () => {
    axios.get.mockResolvedValueOnce({ data: { days: 31, buckets: [] } });
    render(<InjuryAnalysisDialog {...props()} />);
    await screen.findByText('No recorded injuries for these filters and dates.');
    axios.get.mockRejectedValueOnce({ response: { data: { error: 'Analysis unavailable' } } });
    fireEvent.change(screen.getByLabelText('Group by'), { target: { value: 'quarterly' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Analysis unavailable');
    expect(screen.queryByText('Timeline chart')).toBeNull();
  });
  it('ignores an older response after the filters change', async () => {
    let resolveOld;
    axios.get.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveOld = resolve;
        }),
    );
    const initial = props();
    render(<InjuryAnalysisDialog {...initial} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'ArrowDown', keyCode: 40 });
    fireEvent.click(screen.getByText('Analysis project'));
    await screen.findByText('Timeline chart');
    resolveOld({ data: { days: 31, buckets: [] } });
    await screen.findByText('Timeline chart');
    expect(axios.get.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it('collapses filters and summarizes their active selections', async () => {
    render(
      <InjuryAnalysisDialog
        {...props()}
        filters={makeFilters([{ value: 'project', label: 'Example project' }])}
      />,
    );
    await screen.findByText('Timeline chart');
    const button = screen.getByRole('button', { name: 'Filters' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(/Projects: Example project/)).toBeTruthy();
    expect(screen.getByLabelText('Projects')).not.toBeVisible();
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Projects')).toBeVisible();
  });

  it('supports presets and keeps an automatic baseline equal in length', async () => {
    render(<InjuryAnalysisDialog {...props()} />);
    await screen.findByText('Timeline chart');
    fireEvent.change(screen.getByLabelText('Date preset'), { target: { value: '6' } });
    await screen.findByText('Timeline chart');
    const selected = axios.get.mock.lastCall[1].params;
    expect(screen.getByLabelText('Date preset')).toHaveValue('6');
    fireEvent.click(screen.getByRole('button', { name: 'Compare periods' }));
    await screen.findByText('Comparison chart');
    expect(screen.getByLabelText('Baseline period')).toHaveValue('previous');
    const baseline = axios.get.mock.calls.at(-2)[1].params;
    expect(new Date(baseline.endDate) - new Date(baseline.startDate)).toBe(
      new Date(selected.endDate) - new Date(selected.startDate),
    );
    fireEvent.change(screen.getAllByLabelText('End date')[1], {
      target: { value: selected.endDate.slice(0, 8) + '01' },
    });
    expect(screen.getByLabelText('Date preset')).toHaveValue('custom');
  });

  it('restores saved exploration settings when the dialog is reopened', async () => {
    const save = vi.fn();
    const initial = props();
    const { unmount } = render(<InjuryAnalysisDialog {...initial} onSettingsChange={save} />);
    await screen.findByText('Timeline chart');
    fireEvent.keyDown(screen.getByLabelText('Worker categories'), { key: 'Backspace', keyCode: 8 });
    expect(await screen.findByText('Select at least one worker category.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Group by'), { target: { value: 'quarterly' } });
    fireEvent.click(screen.getByRole('button', { name: 'Compare periods' }));
    await screen.findByText('Comparison chart');
    const settings = save.mock.lastCall[0];
    unmount();
    render(
      <InjuryAnalysisDialog {...initial} initialSettings={settings} onSettingsChange={save} />,
    );
    await screen.findByText('Comparison chart');
    expect(screen.getByRole('button', { name: 'Compare periods' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(axios.get.mock.lastCall[1].params.interval).toBe('quarterly');
    expect(screen.getAllByLabelText('Start date')[1]).toHaveValue(settings.rangeB.start);
    fireEvent.click(screen.getByRole('button', { name: 'Trend' }));
    expect(await screen.findByText('Select at least one worker category.')).toBeTruthy();
  });

  it('shows significant severity changes only in comparison mode and refreshes them with filters', async () => {
    const initial = props();
    render(<InjuryAnalysisDialog {...initial} />);
    await screen.findByText('Timeline chart');
    expect(screen.queryByRole('heading', { name: 'Significant changes' })).toBeNull();
    const makeData = count => ({
      days: 31,
      buckets: [{ records: [{ workerCategory: 'Carpenter', severity: 'Serious', count }] }],
    });
    axios.get
      .mockResolvedValueOnce({ data: makeData(1) })
      .mockResolvedValueOnce({ data: makeData(30) });
    fireEvent.click(screen.getByRole('button', { name: 'Compare periods' }));
    const card = await screen.findByRole('article', { name: 'Carpenter comparison' });
    expect(screen.queryByRole('heading', { name: 'Significant changes' })).toBeNull();
    const signal = within(card).getByRole('button', {
      name: 'Show significant severity changes for Carpenter',
    });
    expect(signal).toHaveTextContent('Serious · Significant');
    expect(signal).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(signal);
    await screen.findAllByText(/Rate increase supported/);
    expect(within(card).getByText('Serious')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Details', exact: true })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'ArrowDown', keyCode: 40 });
    fireEvent.click(screen.getByText('Analysis project'));
    await screen.findByRole('article', { name: 'Staff comparison' });
    expect(screen.queryByRole('heading', { name: 'Significant changes' })).toBeNull();
    expect(screen.queryByText('Inconclusive')).toBeNull();
    expect(screen.queryAllByText(/Rate increase supported/)).toHaveLength(0);
    expect(screen.queryByRole('button', { name: /Show significant severity changes/ })).toBeNull();
  });

  it('sends project names from the actual project-list response rather than invalid MongoDB IDs', async () => {
    render(
      <InjuryAnalysisDialog
        {...props()}
        filters={makeFilters([
          {
            value: 'solar panel project',
            label: 'Solar Panel Project',
            projectName: 'Solar Panel Project',
          },
        ])}
      />,
    );
    await screen.findByText('Timeline chart');
    expect(axios.get.mock.lastCall[1].params.projectNames).toBe('Solar Panel Project');
    expect(axios.get.mock.lastCall[1].params.projectIds).toBeUndefined();
  });

  it('shows count reductions separately from evidence, expands details, and searches and sorts cards', async () => {
    const makeData = (carpenter, electrician) => ({
      days: 183,
      buckets: [
        {
          records: [
            { workerCategory: 'Carpenter', severity: 'Serious', count: carpenter },
            { workerCategory: 'Electrician', severity: 'Serious', count: electrician },
          ],
        },
      ],
    });
    axios.get
      .mockResolvedValueOnce({ data: makeData(6, 12) })
      .mockResolvedValueOnce({ data: makeData(0, 3) });
    render(
      <InjuryAnalysisDialog
        {...props()}
        initialSettings={{ view: 'compare', rangeB: { start: '2025-01-01', end: '2025-01-31' } }}
      />,
    );
    const card = await screen.findByRole('article', { name: 'Carpenter comparison' });
    expect(within(card).getByText('A total')).toBeTruthy();
    expect(within(card).getByText('B total')).toBeTruthy();
    expect(within(card).getByText('↓ 100%')).toBeTruthy();
    expect(within(card).queryByText('Inconclusive')).toBeNull();
    expect(screen.queryByText('Totals across selected severities')).toBeNull();
    expect(screen.queryByText(/Poisson|Holm/)).toBeNull();
    fireEvent.click(within(card).getByRole('button', { name: 'Show Carpenter severity details' }));
    expect(within(card).getByText('Serious')).toBeVisible();
    const breakdown = within(card).getByRole('table', { name: 'Severity breakdown' });
    const headers = within(breakdown).getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Severity');
    expect(headers[1]).toHaveTextContent('A total');
    expect(headers[2]).toHaveTextContent('B total');
    expect(headers[3]).toHaveTextContent('Change');
    const values = within(within(breakdown).getByRole('row', { name: /Serious/ })).getAllByRole(
      'cell',
    );
    expect(values[0]).toHaveTextContent('6');
    expect(values[1]).toHaveTextContent('0');
    expect(screen.queryByText('Inconclusive')).toBeNull();
    fireEvent.change(screen.getByLabelText('Sort categories'), { target: { value: 'decrease' } });
    expect(screen.getAllByRole('article')[0]).toHaveAccessibleName('Electrician comparison');
    fireEvent.change(screen.getByLabelText('Find category'), { target: { value: 'Electrician' } });
    expect(screen.queryByRole('article', { name: 'Carpenter comparison' })).toBeNull();
  });
});
