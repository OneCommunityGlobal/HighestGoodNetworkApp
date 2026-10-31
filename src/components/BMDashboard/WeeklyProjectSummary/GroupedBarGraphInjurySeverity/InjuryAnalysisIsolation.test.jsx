import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import InjuryCategoryBarChart from './InjuryCategoryBarChart';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('react-datepicker', () => ({
  default: ({ id, selected, onChange }) => (
    <input
      id={id}
      type="date"
      value={selected ? selected.toISOString().slice(0, 10) : ''}
      onChange={event => onChange(new Date(`${event.target.value}T00:00:00`))}
    />
  ),
}));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  LabelList: () => null,
  CartesianGrid: () => null,
  ReferenceLine: () => null,
  Text: () => null,
}));

describe('snapshot and exploration isolation', () => {
  it('loads unrestricted project choices and keeps snapshot dates and severity untouched', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    const project = { _id: 'fixture project', name: 'Fixture project' };
    const snapshotRows = [
      {
        workerCategory: 'Carpenter',
        projectId: '65419e61105441587e2dec99',
        projectName: project.name,
        totalInjuries: 3,
      },
    ];
    axios.get.mockImplementation(async url => {
      let data = [];
      if (url.includes('project-injury')) data = [project];
      else if (url.includes('injury-severities')) data = ['Low', 'Serious'];
      else if (url.includes('injury-types')) data = ['Fall'];
      else if (url.includes('category-breakdown')) data = snapshotRows;
      else if (url.includes('category-analysis'))
        data = {
          days: 31,
          buckets: [
            {
              key: '2026-01',
              label: 'Jan 2026',
              records: [{ workerCategory: 'Carpenter', severity: 'Low', count: 3 }],
            },
          ],
        };
      return { data };
    });
    const initial = {
      theme: { darkMode: false },
      bmInjury: {
        data: snapshotRows,
        projects: [project],
        severities: ['Low', 'Serious'],
        injuryTypes: ['Fall'],
        loading: false,
      },
    };
    const store = createStore((state = initial) => state, applyMiddleware(thunk));
    render(
      <Provider store={store}>
        <InjuryCategoryBarChart />
      </Provider>,
    );
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-01-01' } });
    await waitFor(() =>
      expect(
        axios.get.mock.calls.some(
          ([url, options]) =>
            url.includes('project-injury') && options?.params?.startDate === '2026-01-01',
        ),
      ).toBe(true),
    );
    const snapshotRequests = () =>
      axios.get.mock.calls.filter(([url]) => url.includes('category-breakdown')).length;
    const before = snapshotRequests();
    fireEvent.click(screen.getByRole('button', { name: 'Time series' }));
    await screen.findByRole('img', { name: 'Injury counts over time by worker category' });
    expect(
      axios.get.mock.calls.some(
        ([url, options]) => url.includes('project-injury') && options?.params === undefined,
      ),
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.keyDown(screen.getByLabelText('Severities', { selector: '#analysis-severities' }), {
      key: 'ArrowDown',
      keyCode: 40,
    });
    fireEvent.click(screen.getByRole('option', { name: 'Low' }));
    await waitFor(() =>
      expect(
        axios.get.mock.calls.some(
          ([url, options]) =>
            url.includes('category-analysis') && options.params.severities === 'Low',
        ),
      ).toBe(true),
    );
    expect(snapshotRequests()).toBe(before);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByText('All severities')).toBeVisible();
    expect(screen.getByLabelText('Start date')).toHaveValue('2026-01-01');
  });
});
