import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import axios from 'axios';
import moment from 'moment';
import BMTimeLogger from '../BMTimeLogger';
import { LoggingButtons } from '../../Projects/ProjectDetails/LogBar';
import { bmTimeLoggerReducer } from '../../../../reducers/bmdashboard/timeLoggerReducer';
import { bmProjectMemberReducer } from '../../../../reducers/bmdashboard/projectMemberReducer';
import { errorsReducer } from '../../../../reducers/errorsReducer';
import { fetchBMProjectMembers } from '../../../../actions/bmdashboard/projectMemberAction';

vi.mock('axios');
vi.mock('../BMTimeLogSummary', () => ({ default: () => null }));
vi.mock('../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => () => {},
}));
const members = [
  { user: { _id: 'alice', firstName: 'Alice', lastName: 'Smith', role: 'Volunteer' } },
  { user: { _id: 'bob', firstName: 'Bob', lastName: 'Jones', role: 'Manager' } },
];
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const setup = (path = '/bmdashboard/timelog/project-a') => {
  const history = createMemoryHistory({ initialEntries: [path] });
  const store = createStore(
    combineReducers({
      bmTimeLogger: bmTimeLoggerReducer,
      bmProjectMembers: bmProjectMemberReducer,
      bmProjects: (
        state = [
          { _id: 'project-a', name: 'Project A' },
          { _id: 'project-b', name: 'Project B' },
        ],
      ) => state,
      errors: errorsReducer,
      theme: (state = {}) => state,
    }),
    applyMiddleware(thunk),
  );
  const utils = render(
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route exact path="/bmdashboard/timelog/:projectId?" component={BMTimeLogger} />
          <Route path="/bmdashboard/project/:projectId">
            <LoggingButtons />
          </Route>
          <Route path="/away">
            <p>Another page</p>
          </Route>
        </Switch>
      </Router>
    </Provider>,
  );
  return { ...utils, store, history };
};

describe('Timelog project and timer context', () => {
  let persisted;
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T17:00:00Z'));
    persisted = null;
    axios.get.mockImplementation(async url => {
      if (url.endsWith('/users')) return { data: { members } };
      if (url.includes('/alice/logs')) return { data: persisted ? [persisted] : [] };
      return { data: [] };
    });
    axios.post.mockImplementation(async url => {
      if (url.endsWith('/start')) {
        persisted = {
          _id: 'log',
          status: 'ongoing',
          totalElapsedTime: 0,
          createdAt: new Date(Date.now()).toISOString(),
          updatedAt: new Date(Date.now()).toISOString(),
        };
        return { data: { timeLog: persisted } };
      }
      return { data: { timeLog: { ...persisted, status: 'completed' } } };
    });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('starts, searches, clears, retries, and navigates back without changing the persisted timer or project', async () => {
    const { history, store, unmount } = setup();
    await settle();
    const selector = screen.getByRole('combobox');
    expect(selector).toHaveValue('project-a');
    expect(screen.getByText(`Date: ${moment().format('MM/DD/YY')}`)).toBeInTheDocument();
    const alice = screen.getByRole('group', { name: 'Alice Smith time log' });
    fireEvent.click(within(alice).getByRole('button', { name: 'START' }));
    await settle();
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(within(alice).getByText('00:00:10')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search members'), { target: { value: 'bob' } });
    expect(alice).not.toBeVisible();
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    expect(screen.getByRole('group', { name: 'Alice Smith time log' })).toBe(alice);
    expect(within(alice).getByText('00:00:30')).toBeInTheDocument();
    expect(selector).toHaveValue('project-a');
    axios.get.mockRejectedValueOnce(new Error('Offline'));
    await act(async () => {
      await store.dispatch(fetchBMProjectMembers('project-a'));
    });
    expect(within(alice).getByRole('button', { name: 'PAUSE' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await settle();
    expect(selector).toHaveValue('project-a');
    expect(within(alice).getByText('00:00:30')).toBeInTheDocument();
    act(() => {
      history.push('/away');
    });
    expect(screen.getByText('Another page')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(40000);
      history.goBack();
    });
    await settle();
    expect(screen.getByRole('combobox')).toHaveValue('project-a');
    const restored = screen.getByRole('group', { name: 'Alice Smith time log' });
    expect(within(restored).getByText('00:01:10')).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][0]).toContain('/start');
    fireEvent.click(within(restored).getByRole('button', { name: 'CLEAR' }));
    await settle();
    expect(axios.post.mock.calls[1][0]).toContain('/stop');
    unmount();
  });

  it('updates project context in the URL and restores selection with browser back', async () => {
    const { history, unmount } = setup();
    await settle();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'project-b' } });
    await settle();
    expect(history.location.pathname).toBe('/bmdashboard/timelog/project-b');
    expect(screen.getByRole('combobox')).toHaveValue('project-b');
    act(() => {
      history.goBack();
    });
    await settle();
    expect(screen.getByRole('combobox')).toHaveValue('project-a');
    unmount();
  });

  it('opens the check-in page for the project linked from project details', async () => {
    const { history, unmount } = setup('/bmdashboard/project/project-b');
    fireEvent.click(screen.getByRole('link', { name: 'Time' }));
    await settle();
    expect(history.location.pathname).toBe('/bmdashboard/timelog/project-b');
    expect(screen.getByRole('combobox')).toHaveValue('project-b');
    unmount();
  });
});
