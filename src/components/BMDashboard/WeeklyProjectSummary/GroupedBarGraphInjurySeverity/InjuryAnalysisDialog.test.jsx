import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import InjuryAnalysisDialog from './InjuryAnalysisDialog';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: () => <div>Timeline chart</div>,
  BarChart: () => <div>Comparison chart</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  CartesianGrid: () => null,
}));
const data = {
  days: 31,
  buckets: [
    { label: 'Jan 2025', records: [{ workerCategory: 'Staff', severity: 'Low', count: 3 }] },
  ],
};
const makeFilters = (value = []) => [
  { id: 'projects', label: 'Projects', options: [], value, onChange: vi.fn() },
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
  it('loads a timeline, changes grouping, and reloads with shared filters', async () => {
    const initial = props();
    const { rerender } = render(<InjuryAnalysisDialog {...initial} />);
    await screen.findByText('Timeline chart');
    expect(axios.get.mock.calls[0][1].params).toMatchObject({
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      interval: 'monthly',
    });
    fireEvent.change(screen.getByLabelText('Group by'), { target: { value: 'quarterly' } });
    await waitFor(() => expect(axios.get.mock.lastCall[1].params.interval).toBe('quarterly'));
    rerender(
      <InjuryAnalysisDialog
        {...initial}
        filters={makeFilters([{ value: '65419e61105441587e2dec99', label: 'Project' }])}
      />,
    );
    await waitFor(() =>
      expect(axios.get.mock.lastCall[1].params.projectIds).toBe('65419e61105441587e2dec99'),
    );
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
    const { rerender } = render(<InjuryAnalysisDialog {...initial} />);
    rerender(
      <InjuryAnalysisDialog
        {...initial}
        filters={makeFilters([{ value: '65419e61105441587e2dec99', label: 'Project' }])}
      />,
    );
    await screen.findByText('Timeline chart');
    resolveOld({ data: { days: 31, buckets: [] } });
    await screen.findByText('Timeline chart');
    expect(axios.get.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
