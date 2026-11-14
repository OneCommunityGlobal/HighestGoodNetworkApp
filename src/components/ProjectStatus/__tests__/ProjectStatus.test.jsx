import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import mockConfigureStore from 'redux-mock-store';
import ProjectStatus from '../ProjectStatus';
import styles from '../ProjectStatus.module.css';
import { fetchProjectStatusSummary } from '../../../services/projectStatusService';

vi.mock('../../../services/projectStatusService', () => ({ fetchProjectStatusSummary: vi.fn() }));
vi.mock('react-datepicker', () => ({
  default: ({ selected, onChange, placeholderText }) => (
    <input
      type="date"
      aria-label={placeholderText}
      value={selected ? selected.toISOString().slice(0, 10) : ''}
      onChange={event =>
        onChange(event.target.value ? new Date(`${event.target.value}T12:00:00`) : null)
      }
    />
  ),
}));
// Exercise Chart.js callbacks without requiring canvas rendering in jsdom.
vi.mock('react-chartjs-2', () => ({
  Doughnut: ({ options }) => (
    <div>
      {['Active', 'Completed', 'Delayed'].map((label, index) => (
        <button
          key={label}
          type="button"
          onMouseOver={() => options.onHover({}, [{ index }])}
          onFocus={() => options.onHover({}, [{ index }])}
          onClick={() => options.onClick({}, [{ index }])}
        >
          {label} segment
        </button>
      ))}
    </div>
  ),
}));

const summary = {
  totalProjects: 10,
  activeProjects: 6,
  completedProjects: 3,
  delayedProjects: 1,
  percentages: { active: 60, completed: 30, delayed: 10 },
};
const previous = { totalProjects: 10, activeProjects: 4, completedProjects: 2, delayedProjects: 4 };
const mockStore = mockConfigureStore([]);
const openPage = async (darkMode = false) => {
  render(
    <Provider store={mockStore({ theme: { darkMode } })}>
      <ProjectStatus />
    </Provider>,
  );
  await screen.findByText('Select both dates to compare equal-length ranges.');
};
const applyRange = (start = '2024-03-01', end = '2024-03-03') => {
  fireEvent.change(screen.getByLabelText('From Date'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('To Date'), { target: { value: end } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
};
beforeEach(() => {
  fetchProjectStatusSummary.mockReset();
  fetchProjectStatusSummary.mockResolvedValue(summary);
});

it('compares adjacent equal-length inclusive ranges across leap day', async () => {
  await openPage();
  fetchProjectStatusSummary.mockResolvedValueOnce(summary).mockResolvedValueOnce(previous);
  applyRange();
  await screen.findByLabelText('Active change: ↑ 50.0%');
  expect(screen.getByLabelText('Completed change: ↑ 50.0%')).toBeInTheDocument();
  expect(screen.getByLabelText('Delayed change: ↓ 75.0%')).toBeInTheDocument();
  expect(screen.getByText('↓ Delayed count decreasing')).toBeInTheDocument();
  const opts = fetchProjectStatusSummary.mock.calls[2][0];
  expect(opts.startDate.format('YYYY-MM-DD')).toBe('2024-02-27');
  expect(opts.endDate.format('YYYY-MM-DD')).toBe('2024-02-29');
  expect(screen.getByText(/not historical snapshots/)).toBeInTheDocument();
});

it.each([
  [0, 0, '0.0% · No change', '→ Delayed count unchanged'],
  [2, 0, 'New · Previous count was 0', '↑ Delayed count increasing'],
  [0, 2, '↓ 100.0%', '↓ Delayed count decreasing'],
  [2, 2, '0.0% · No change', '→ Delayed count unchanged'],
])('handles delayed counts %s vs %s', async (current, baseline, change, trend) => {
  await openPage(true);
  fetchProjectStatusSummary
    .mockResolvedValueOnce({ ...summary, delayedProjects: current })
    .mockResolvedValueOnce({ ...previous, delayedProjects: baseline });
  applyRange('2024-03-01', '2024-03-01');
  await screen.findByLabelText(`Delayed change: ${change}`);
  expect(screen.getByText(trend)).toBeInTheDocument();
  const opts = fetchProjectStatusSummary.mock.calls[2][0];
  expect(opts.startDate.format('YYYY-MM-DD')).toBe('2024-02-29');
  expect(opts.endDate.format('YYYY-MM-DD')).toBe('2024-02-29');
});

it('reports unavailable comparison when the previous range has no projects', async () => {
  await openPage();
  fetchProjectStatusSummary
    .mockResolvedValueOnce(summary)
    .mockResolvedValueOnce({ totalProjects: 0 });
  applyRange();
  await screen.findByText('No projects in the previous range; comparison unavailable.');
  expect(screen.getByLabelText('Active change: —')).toBeInTheDocument();
  expect(screen.getByText('Delayed trend unavailable')).toBeInTheDocument();
});

it('preserves current counts when the comparison request fails', async () => {
  await openPage();
  fetchProjectStatusSummary
    .mockResolvedValueOnce(summary)
    .mockRejectedValueOnce(new Error('Offline'));
  applyRange();
  await screen.findByText('Previous range unavailable. Apply again to retry.');
  expect(screen.getByText('6')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Active segment' })).toBeInTheDocument();
});

it('preserves open-ended filters and Reset without inventing comparisons', async () => {
  await openPage();
  fireEvent.change(screen.getByLabelText('From Date'), { target: { value: '2024-03-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(2));
  await screen.findByText('Select both dates to compare equal-length ranges.');
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenLastCalledWith({}));
  expect(screen.getByLabelText('From Date')).toHaveValue('');
});

it('highlights hovered and clicked KPIs and supports legend selection and help', async () => {
  await openPage();
  const delayed = screen.getByRole('group', { name: 'Delayed projects' });
  const segment = screen.getByRole('button', { name: 'Delayed segment' });
  fireEvent.mouseOver(segment);
  expect(delayed).toHaveClass(styles.statHighlighted);
  fireEvent.mouseLeave(screen.getByRole('group', { name: 'Project status chart' }));
  expect(delayed).not.toHaveClass(styles.statHighlighted);
  fireEvent.click(segment);
  fireEvent.mouseLeave(screen.getByRole('group', { name: 'Project status chart' }));
  expect(delayed).toHaveClass(styles.statHighlighted);
  fireEvent.click(screen.getByRole('button', { name: 'Completed', exact: true }));
  expect(screen.getByRole('group', { name: 'Completed projects' })).toHaveClass(
    styles.statHighlighted,
  );
  expect(delayed).not.toHaveClass(styles.statHighlighted);
  fireEvent.click(screen.getByRole('button', { name: 'Completed', exact: true }));
  expect(screen.getByRole('group', { name: 'Completed projects' })).not.toHaveClass(
    styles.statHighlighted,
  );
  expect(screen.getByRole('button', { name: 'About active projects' })).toHaveAttribute(
    'aria-describedby',
    'project-status-active-help',
  );
});

it('ignores an outdated comparison response after Reset', async () => {
  await openPage();
  let resolvePrevious;
  fetchProjectStatusSummary.mockResolvedValueOnce(summary).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        resolvePrevious = resolve;
      }),
  );
  applyRange();
  await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(3));
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await screen.findByText('Select both dates to compare equal-length ranges.');
  resolvePrevious(previous);
  await waitFor(() => expect(screen.queryByText(/Compared with/)).not.toBeInTheDocument());
});
