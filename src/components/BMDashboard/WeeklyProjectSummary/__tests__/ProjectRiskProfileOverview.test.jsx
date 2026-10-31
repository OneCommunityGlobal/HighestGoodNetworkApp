// v1.1.0
import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import httpService from '../../../../services/httpService';
import ProjectRiskProfileOverview, { RiskTooltip } from '../ProjectRiskProfileOverview';
import BMProtectedRoute from '../../../common/BMDashboard/BMProtectedRoute';

vi.mock('../../../../services/httpService', () => ({ default: { get: vi.fn() } }));
vi.mock('recharts', async () => {
  const original = await vi.importActual('recharts');
  return {
    ...original,
    // jsdom has no layout; keep real charts with deterministic measured dimensions.
    ResponsiveContainer: ({ children }) =>
      React.cloneElement(children, { width: 800, height: 340 }),
  };
});
const data = [
  { projectName: 'Alpha', predictedCostOverrun: -10, predictedTimeDelay: 100, totalOpenIssues: 0 },
  { projectName: 'Bravo', predictedCostOverrun: 15, predictedTimeDelay: 120, totalOpenIssues: 10 },
  {
    projectName: 'Charlie',
    predictedCostOverrun: null,
    predictedTimeDelay: 100,
    totalOpenIssues: 0,
  },
];
function renderPage(
  darkMode = false,
  auth = {
    isAuthenticated: true,
    user: { role: 'Administrator', access: { canAccessBMPortal: true } },
  },
) {
  const store = createStore(() => ({ theme: { darkMode }, auth, role: { roles: [] } }));
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard/project-risk-profile']}>
        <BMProtectedRoute
          path="/dashboard/project-risk-profile"
          component={ProjectRiskProfileOverview}
        />
      </MemoryRouter>
    </Provider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  httpService.get.mockResolvedValue({ data });
});

it.each([false, true])(
  'ranks actual snapshots with accessible risk labels (darkMode=%s)',
  async darkMode => {
    renderPage(darkMode);
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bravo');
    expect(rows[1]).toHaveTextContent('High');
    expect(rows[1]).toHaveTextContent('100/100');
    expect(rows[1]).toHaveTextContent('Escalate');
    expect(rows[2]).toHaveTextContent('10% under budget');
    expect(rows[3]).toHaveTextContent('Unknown');
    expect(rows[3]).toHaveTextContent('Verify missing metrics');
    expect(screen.queryByLabelText('History period')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Sort projects'), { target: { value: 'name' } });
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Alpha');
    fireEvent.change(screen.getByLabelText('Chart metric'), { target: { value: 'delay' } });
    expect(screen.getByLabelText('Chart metric')).toHaveValue('delay');
  },
);

it('clearing the project selection shows an empty result instead of all projects', async () => {
  renderPage();
  await screen.findByRole('table');
  fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'Backspace', code: 'Backspace' });
  fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'Backspace', code: 'Backspace' });
  fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'Backspace', code: 'Backspace' });
  expect(
    await screen.findByText('No data available for the selected filters.'),
  ).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

it('displays fetch failures and retries', async () => {
  httpService.get.mockRejectedValueOnce(new Error('offline'));
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch');
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByRole('table')).toBeInTheDocument();
  expect(httpService.get).toHaveBeenCalledTimes(2);
});

it.each([[], null])(
  'handles empty or malformed responses without claiming low risk (%s)',
  async response => {
    httpService.get.mockResolvedValue({ data: response });
    renderPage();
    if (response === null)
      expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch');
    else
      expect(
        await screen.findByText('No data available for the selected filters.'),
      ).toBeInTheDocument();
  },
);

it('validates historical dates and displays real period comparisons', async () => {
  const today = new Date();
  const observation = days => ({
    ...data[1],
    date: new Date(today.getTime() - days * 86400000).toISOString(),
  });
  httpService.get.mockResolvedValue({
    data: [
      {
        ...data[1],
        history: [observation(0), observation(10), { ...observation(35), predictedCostOverrun: 5 }],
      },
    ],
  });
  renderPage();
  const table = await screen.findByRole('table');
  expect(table).toHaveTextContent('Cost variance: +10 pp');
  fireEvent.change(screen.getByLabelText('History period'), { target: { value: 'custom' } });
  expect(screen.getByRole('alert')).toHaveTextContent('Choose a start date');
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-10-15' } });
  fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-10-01' } });
  expect(screen.getByRole('alert')).toHaveTextContent('on or before');
});

it('shows explanations, comparisons, and actions in hover details', () => {
  render(
    <RiskTooltip
      active
      payload={[
        {
          payload: {
            projectName: 'Bravo',
            level: 'High',
            score: 100,
            cost: 15,
            delay: 20,
            issues: 10,
            explanation: 'Time delay contributes most.',
            comparison: 'Change vs previous period: unavailable.',
            action: 'Escalate to the project lead.',
          },
        },
      ]}
    />,
  );
  expect(screen.getByText('Time delay contributes most.')).toBeInTheDocument();
  expect(screen.getByText('Change vs previous period: unavailable.')).toBeInTheDocument();
  expect(screen.getByText(/Escalate to the project lead/)).toBeInTheDocument();
});

it.each([
  { isAuthenticated: false, user: {} },
  { isAuthenticated: true, user: { access: { canAccessBMPortal: false } } },
])('keeps the BM portal access guard for the standalone page', async auth => {
  renderPage(false, auth);
  await waitFor(() =>
    expect(screen.queryByText('Project Risk Profile Overview')).not.toBeInTheDocument(),
  );
  expect(httpService.get).not.toHaveBeenCalled();
});

it('lets users deselect and reselect projects directly from the dropdown', async () => {
  renderPage();
  const table = await screen.findByRole('table');
  fireEvent.keyDown(screen.getByLabelText('Projects'), { key: 'ArrowDown' });
  const option = await screen.findByRole('option', { name: 'Bravo' });
  fireEvent.click(option);
  expect(within(table).queryByRole('rowheader', { name: /Bravo/ })).not.toBeInTheDocument();
  expect(within(table).getAllByRole('row')).toHaveLength(3);
  expect(screen.queryByText('Bravo', { selector: 'tspan' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('option', { name: 'Bravo' }));
  expect(within(table).getByRole('rowheader', { name: /Bravo/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'All projects' }));
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4);
  expect(httpService.get).toHaveBeenCalledTimes(1);
});

it('updates the chart and score when a valid historical period changes', async () => {
  httpService.get.mockResolvedValue({
    data: [
      {
        ...data[0],
        history: [
          { ...data[0], date: '2026-09-01' },
          { ...data[1], date: '2026-09-10' },
        ],
      },
    ],
  });
  renderPage();
  fireEvent.change(await screen.findByLabelText('History period'), { target: { value: 'custom' } });
  fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-09-01' } });
  fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-09-01' } });
  expect(screen.getByRole('table')).toHaveTextContent('0/100');
  expect(screen.getByText('-10%', { selector: '.recharts-label tspan' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-09-10' } });
  expect(screen.getByRole('table')).toHaveTextContent('100/100');
  expect(screen.getByText('15%', { selector: '.recharts-label tspan' })).toBeInTheDocument();
  expect(httpService.get).toHaveBeenCalledTimes(1);
});

it('shows zero-delay chart labels instead of an apparently empty graph', async () => {
  httpService.get.mockResolvedValue({ data: [data[0], data[2]] });
  renderPage();
  await screen.findByRole('table');
  fireEvent.change(screen.getByLabelText('Chart metric'), { target: { value: 'delay' } });
  expect(
    screen.getByText(/All selected projects with delay data report 0% delay/),
  ).toBeInTheDocument();
  expect(screen.getAllByText('0%', { selector: '.recharts-label tspan' })).toHaveLength(2);
});

it('aborts an unfinished request when the panel is unmounted', () => {
  let signal;
  let aborted = false;
  httpService.get.mockImplementation((url, config) => {
    signal = config?.signal;
    signal?.addEventListener('abort', () => {
      aborted = true;
    });
    return new Promise(() => {});
  });
  const { unmount } = renderPage();
  expect(screen.getByRole('status')).toHaveTextContent('Loading');
  unmount();
  expect(aborted).toBe(true);
});

it('rejects malformed project names instead of crashing during rendering', async () => {
  httpService.get.mockResolvedValue({
    data: [{ ...data[0], projectName: { name: 'Bad payload' } }],
  });
  renderPage();
  expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch');
});
