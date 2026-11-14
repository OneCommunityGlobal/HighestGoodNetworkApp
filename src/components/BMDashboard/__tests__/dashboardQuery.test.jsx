import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ProjectsList from '../Projects/ProjectsList';
import ProjectStatusDonutChart from '../ProjectStatus/ProjectStatusDonutChart';
import { readStatusDates } from '../dashboardQuery';
import { fetchProjectStatusSummary } from '~/services/projectStatusService';

vi.mock('~/services/projectStatusService', () => ({
  fetchProjectStatusSummary: vi.fn(),
}));

vi.mock('react-select', () => ({
  default: ({ options, value, onChange }) => (
    <select
      aria-label="Select projects"
      multiple
      value={value.map(option => option.value)}
      onChange={event => {
        const selected = Array.from(event.target.selectedOptions, option => option.value);
        onChange(options.filter(option => selected.includes(option.value)));
      }}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: ({ children }) => <div>{children}</div>,
  Cell: () => null,
  Label: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Line: () => null,
  LineChart: ({ children }) => <div>{children}</div>,
}));

const projects = [
  { _id: '507f1f77bcf86cd799439011', name: 'Alpha', members: [{}] },
  { _id: '507f1f77bcf86cd799439012', name: 'Beta', members: [{}, {}] },
  { _id: '507f1f77bcf86cd799439013', name: 'Gamma', members: [] },
];
const summary = { totalProjects: 1, activeProjects: 1, completedProjects: 0, delayedProjects: 0 };

function setup(search = '', initialProjects = projects, withChart = false) {
  const history = createMemoryHistory({ initialEntries: [`/bmdashboard${search}#section`] });
  const store = createStore(
    (state = { bmProjects: initialProjects, theme: { darkMode: false } }, action) =>
      action.type === 'LOAD_PROJECTS' ? { ...state, bmProjects: action.projects } : state,
  );
  const view = render(
    <Provider store={store}>
      <Router history={history}>
        {withChart && <ProjectStatusDonutChart />}
        <ProjectsList />
      </Router>
    </Provider>,
  );
  return { history, store, ...view };
}

function selectProjects(ids) {
  const select = screen.getByRole('listbox', { name: 'Select projects' });
  within(select)
    .getAllByRole('option')
    .forEach(option => {
      option.selected = ids.includes(option.value);
    });
  fireEvent.change(select);
}

describe('dashboard query persistence', () => {
  beforeEach(() => {
    fetchProjectStatusSummary.mockReset();
    fetchProjectStatusSummary.mockResolvedValue(summary);
  });

  it('restores a bookmarked selection after async project loading and reload', () => {
    const search = `?other=keep&bmProject=${projects[1]._id}&bmProject=${projects[0]._id}`;
    const { store, history, unmount } = setup(search, []);
    expect(
      screen.getByText(/Selected projects are unavailable or still loading/),
    ).toBeInTheDocument();
    act(() => store.dispatch({ type: 'LOAD_PROJECTS', projects }));
    expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
    expect(screen.getByText('Beta Summary')).toBeInTheDocument();
    expect(screen.queryByText('Gamma Summary')).not.toBeInTheDocument();
    expect(history.entries).toHaveLength(1);
    unmount();
    setup(search);
    expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
    expect(screen.getByText('Beta Summary')).toBeInTheDocument();
    expect(screen.queryByText('Gamma Summary')).not.toBeInTheDocument();
  });

  it('pushes single and multi selections once, preserves other parameters, and restores back/forward', () => {
    const { history } = setup('?other=keep&statusStartDate=2024-01-01');
    selectProjects([projects[0]._id]);
    expect(new URLSearchParams(history.location.search).getAll('bmProject')).toEqual([
      projects[0]._id,
    ]);
    expect(history.location.hash).toBe('#section');
    selectProjects([projects[0]._id, projects[1]._id]);
    expect(history.entries).toHaveLength(3);
    expect(new URLSearchParams(history.location.search).get('other')).toBe('keep');
    expect(new URLSearchParams(history.location.search).get('statusStartDate')).toBe('2024-01-01');
    selectProjects([projects[0]._id, projects[1]._id]);
    expect(history.entries).toHaveLength(3);
    act(() => history.goBack());
    expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
    expect(screen.queryByText('Beta Summary')).not.toBeInTheDocument();
    act(() => history.goForward());
    expect(screen.getByText('Beta Summary')).toBeInTheDocument();
    selectProjects([]);
    expect(screen.getByText('Gamma Summary')).toBeInTheDocument();
    expect(new URLSearchParams(history.location.search).getAll('bmProject')).toEqual([]);
  });

  it('ignores unknown and duplicate IDs without rewriting a bookmark', () => {
    const search = `?bmProject=invalid&bmProject=${projects[0]._id}&bmProject=${projects[0]._id}`;
    const { history } = setup(search);
    expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
    expect(screen.queryByText('Beta Summary')).not.toBeInTheDocument();
    expect(history.location.search).toBe(search);
    act(() => history.push('/bmdashboard?bmProject=removed&other=keep#section'));
    expect(screen.queryByText('Beta Summary')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Selected projects are unavailable or still loading/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear project selection' }));
    expect(screen.getByText('Beta Summary')).toBeInTheDocument();
    expect(history.location.search).toBe('?other=keep');
    expect(history.location.hash).toBe('#section');
    act(() => history.goBack());
    expect(screen.queryByText('Beta Summary')).not.toBeInTheDocument();
  });

  it('does not interpret an empty explicit project parameter as all projects', () => {
    const { history } = setup('?bmProject=');
    expect(screen.queryByText('Alpha Summary')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear project selection' }));
    expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
    expect(history.location.search).toBe('');
  });

  it('switches from unavailable to the matching project when options arrive', () => {
    const { store, history } = setup(`?bmProject=${projects[1]._id}`, [projects[0]]);
    expect(screen.queryByText('Alpha Summary')).not.toBeInTheDocument();
    act(() => store.dispatch({ type: 'LOAD_PROJECTS', projects }));
    expect(screen.getByText('Beta Summary')).toBeInTheDocument();
    expect(screen.queryByText('Alpha Summary')).not.toBeInTheDocument();
    expect(history.entries).toHaveLength(1);
  });

  it('applies chart dates independently, restores them on navigation, and avoids duplicate fetches', async () => {
    const { history } = setup(`?bmProject=${projects[0]._id}&other=keep`, projects, true);
    await screen.findByText('PROJECT STATUS');
    fireEvent.change(screen.getByLabelText('Project status start date'), {
      target: { value: '2024-02-29' },
    });
    fireEvent.change(screen.getByLabelText('Project status end date'), {
      target: { value: '2024-03-01' },
    });
    expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(2));
    expect(fetchProjectStatusSummary).toHaveBeenLastCalledWith({
      startDate: '2024-02-29',
      endDate: '2024-03-01',
    });
    expect(new URLSearchParams(history.location.search).get('bmProject')).toBe(projects[0]._id);
    expect(new URLSearchParams(history.location.search).get('other')).toBe('keep');
    await screen.findByText('PROJECT STATUS');
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(history.entries).toHaveLength(2);
    expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(2);
    act(() => history.goBack());
    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(3));
    expect(fetchProjectStatusSummary).toHaveBeenLastCalledWith({
      startDate: undefined,
      endDate: undefined,
    });
    act(() => history.goForward());
    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(4));
    await screen.findByDisplayValue('2024-02-29');
    selectProjects([projects[1]._id]);
    expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(4);
  });

  it('fetches the bookmarked date range on first render', async () => {
    setup('?statusStartDate=2024-02-29&statusEndDate=2024-03-01', projects, true);
    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(1));
    expect(fetchProjectStatusSummary).toHaveBeenCalledWith({
      startDate: '2024-02-29',
      endDate: '2024-03-01',
    });
    expect(await screen.findByDisplayValue('2024-02-29')).toBeInTheDocument();
  });

  it('rejects reversed date drafts without changing the URL or fetching', async () => {
    const { history } = setup('', projects, true);
    await screen.findByText('PROJECT STATUS');
    fireEvent.change(screen.getByLabelText('Project status start date'), {
      target: { value: '2024-03-01' },
    });
    fireEvent.change(screen.getByLabelText('Project status end date'), {
      target: { value: '2024-02-29' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByRole('alert')).toHaveTextContent('start date on or before the end date');
    expect(history.entries).toHaveLength(1);
    expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(1);
  });

  it('lets users clear dates after an empty result or failed request', async () => {
    fetchProjectStatusSummary
      .mockResolvedValueOnce({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        delayedProjects: 0,
      })
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(summary);
    setup('?statusStartDate=2024-01-01', projects, true);
    await screen.findByText('No project status data available.');
    fireEvent.change(screen.getByLabelText('Project status start date'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await screen.findByText('Unable to load project status.');
    fireEvent.change(screen.getByLabelText('Project status start date'), {
      target: { value: '2024-02-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await screen.findByText('ACTIVE PROJECTS');
    expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(3);
  });

  it('retries a failed request without adding a duplicate history entry', async () => {
    fetchProjectStatusSummary.mockRejectedValueOnce(new Error('Network error'));
    const { history } = setup('?statusStartDate=2024-01-01', projects, true);
    await screen.findByText('Unable to load project status.');
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await screen.findByText('ACTIVE PROJECTS');
    expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(2);
    expect(history.entries).toHaveLength(1);
  });

  it('ignores a stale response after navigation to a different date range', async () => {
    let resolveOld;
    fetchProjectStatusSummary.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveOld = resolve;
        }),
    );
    const { history } = setup('?statusStartDate=2024-01-01', projects, true);
    act(() => history.push('/bmdashboard?statusStartDate=2024-02-01'));
    await screen.findByText('ACTIVE PROJECTS');
    await act(async () => {
      resolveOld({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        delayedProjects: 0,
      });
    });
    expect(screen.queryByText('No project status data available.')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-02-01')).toBeInTheDocument();
  });

  it.each([
    '?statusStartDate=2023-02-29',
    '?statusStartDate=2024-04-31',
    '?statusStartDate=2024-03-01&statusEndDate=2024-02-29',
    '?statusStartDate=2024-01-01&statusStartDate=2024-01-02',
    '?statusStartDate=0000-01-01',
  ])('does not request invalid or ambiguous bookmarked dates: %s', async search => {
    setup(search, projects, true);
    await waitFor(() => expect(fetchProjectStatusSummary).toHaveBeenCalledTimes(1));
    expect(fetchProjectStatusSummary).toHaveBeenCalledWith({
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('accepts a single date bound and leap-century boundaries', () => {
    expect(readStatusDates('?statusStartDate=2000-02-29')).toEqual({
      start: '2000-02-29',
      end: '',
    });
    expect(readStatusDates('?statusEndDate=1900-02-29')).toEqual({ start: '', end: '' });
    expect(readStatusDates('?statusEndDate=2024-12-31')).toEqual({
      start: '',
      end: '2024-12-31',
    });
  });
});
