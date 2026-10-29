import { Provider } from 'react-redux';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { render, screen, fireEvent, act } from '@testing-library/react';
import axios from 'axios';
import BMTimeLogCard from '../BMTimeLogCard';
import BMTimeLogger from '../BMTimeLogger';
import reducer from '../../../../reducers/bmdashboard/projectMemberReducer';
import { errorsReducer } from '../../../../reducers/errorsReducer';
import { fetchBMProjectMembers } from '../../../../actions/bmdashboard/projectMemberAction';
import { GET_ERRORS } from '../../../../constants/errors';

vi.mock('axios');
vi.mock('../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => () => {},
}));
vi.mock('../BMTimeLogSummary', () => ({ default: () => null }));
vi.mock('../BMTimeLogDisplayMember', () => ({
  default: ({ firstName }) => <span>{firstName} member card</span>,
}));
vi.mock('../../shared/BMError', () => ({ default: () => <p>Unrelated timer error</p> }));

const members = [
  {
    user: {
      _id: 'alice',
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'Volunteer',
      teams: ['Builders'],
    },
  },
  {
    user: {
      _id: 'bob',
      firstName: 'Bob',
      lastName: 'Jones',
      role: 'Manager',
      teams: [{ name: 'Garden' }],
    },
  },
  { user: null },
];
const setup = ({ page = false } = {}) => {
  const history = createMemoryHistory({ initialEntries: ['/bmdashboard/timelog'] });
  const store = createStore(
    combineReducers({
      bmProjectMembers: reducer,
      bmProjects: (
        state = [
          { _id: 'a', name: 'Project A' },
          { _id: 'b', name: 'Project B' },
        ],
      ) => state,
      errors: errorsReducer,
      theme: (state = { darkMode: false }) => state,
    }),
    applyMiddleware(thunk),
  );
  const view = project => (
    <Provider store={store}>
      {page ? (
        <Router history={history}>
          <Route path="/bmdashboard/timelog/:projectId?" component={BMTimeLogger} />
        </Router>
      ) : (
        <BMTimeLogCard selectedProject={project} />
      )}
    </Provider>
  );
  const utils = render(view('a'));
  return { ...utils, view, store };
};

describe('BMTimeLogCard request feedback', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows loading until an empty request completes, without premature empty feedback', async () => {
    let resolve;
    axios.get.mockReturnValue(
      new Promise(done => {
        resolve = done;
      }),
    );
    setup();
    expect(screen.getByText('Loading project members...')).toBeInTheDocument();
    expect(screen.queryByText('No members available for this project')).not.toBeInTheDocument();
    await act(async () => {
      resolve({ data: { members: [] } });
    });
    expect(screen.getByText('No members available for this project')).toBeInTheDocument();
    expect(screen.queryByText('Loading project members...')).not.toBeInTheDocument();
  });

  it('shows member failure separately from empty data and shared errors', async () => {
    axios.get.mockRejectedValue(new Error('Network unavailable'));
    setup();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load members. Please try again.',
    );
    expect(screen.queryByText('No members available for this project')).not.toBeInTheDocument();
    expect(screen.queryByText('Unrelated timer error')).not.toBeInTheDocument();
  });

  it('preserves trimmed search, valid card counts, clear actions, and mounted hidden cards', async () => {
    axios.get.mockResolvedValue({ data: { members } });
    setup();
    expect(await screen.findByText('Found 2 out of 2 members')).toBeInTheDocument();
    const alice = screen.getByText('Alice member card');
    const bob = screen.getByText('Bob member card');
    fireEvent.change(screen.getByLabelText('Search members'), {
      target: { value: '  BUILDERS  ' },
    });
    expect(screen.getByText('Found 1 out of 2 members')).toBeInTheDocument();
    expect(alice).toBeVisible();
    expect(bob).not.toBeVisible();
    fireEvent.change(screen.getByLabelText('Search members'), { target: { value: 'missing' } });
    expect(screen.getByText('No members found matching "missing"')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Clear Search')[0]);
    expect(screen.getByText('Found 2 out of 2 members')).toBeInTheDocument();
    expect(screen.getByText('Alice member card')).toBe(alice);
    expect(screen.getByText('Bob member card')).toBe(bob);
    expect(bob).toBeVisible();
    expect(screen.getByLabelText('Search members')).toHaveValue('');
  });

  it('keeps the selected project loading when a previous project completes late', async () => {
    let resolveA;
    let resolveB;
    axios.get
      .mockReturnValueOnce(
        new Promise(done => {
          resolveA = done;
        }),
      )
      .mockReturnValueOnce(
        new Promise(done => {
          resolveB = done;
        }),
      );
    const { rerender, view } = setup();
    rerender(view('b'));
    await act(async () => {
      resolveA({ data: { members } });
    });
    expect(screen.getByText('Loading project members...')).toBeInTheDocument();
    expect(screen.queryByText('Alice member card')).not.toBeInTheDocument();
    await act(async () => {
      resolveB({ data: { members: [] } });
    });
    expect(screen.getByText('No members available for this project')).toBeInTheDocument();
  });

  it('retries an initial failure without reloading and removes the error on recovery', async () => {
    axios.get.mockRejectedValueOnce(new Error('Offline'));
    setup();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load members. Please try again.',
    );
    let resolve;
    axios.get.mockReturnValueOnce(
      new Promise(done => {
        resolve = done;
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Loading project members...')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await act(async () => {
      resolve({ data: { members } });
    });
    expect(screen.getByText('Found 2 out of 2 members')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('keeps cached cards mounted and search applied throughout a failed refresh and retry', async () => {
    axios.get.mockResolvedValueOnce({ data: { members } });
    const { store } = setup();
    await screen.findByText('Found 2 out of 2 members');
    fireEvent.change(screen.getByLabelText('Search members'), { target: { value: 'alice' } });
    const alice = screen.getByText('Alice member card');
    const bob = screen.getByText('Bob member card');
    let reject;
    axios.get.mockReturnValueOnce(
      new Promise((resolve, fail) => {
        reject = fail;
      }),
    );
    let refresh;
    act(() => {
      refresh = store.dispatch(fetchBMProjectMembers('a'));
    });
    expect(screen.getByText('Refreshing project members...')).toBeInTheDocument();
    expect(screen.getByText('Alice member card')).toBe(alice);
    await act(async () => {
      reject(new Error('Offline'));
      await refresh;
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to refresh members. Showing previously loaded data.',
    );
    expect(screen.getByText('Found 1 out of 2 members')).toBeInTheDocument();
    expect(screen.getByLabelText('Search members')).toHaveValue('alice');
    expect(alice).toBeVisible();
    expect(bob).not.toBeVisible();
    let resolve;
    axios.get.mockReturnValueOnce(
      new Promise(done => {
        resolve = done;
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText('Refreshing project members...')).toBeInTheDocument();
    expect(screen.getByText('Alice member card')).toBe(alice);
    await act(async () => {
      resolve({ data: { members: members.slice(0, 1) } });
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search members')).toHaveValue('alice');
    expect(screen.getByText('Found 1 out of 1 members')).toBeInTheDocument();
    expect(screen.getByText('Alice member card')).toBe(alice);
    expect(store.getState().bmProjectMembers.projectId).toBe('a');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('does not use another project cache when the selected project fails', async () => {
    axios.get.mockResolvedValueOnce({ data: { members } });
    const { rerender, view } = setup();
    await screen.findByText('Alice member card');
    axios.get.mockRejectedValueOnce(new Error('Offline'));
    rerender(view('b'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load members. Please try again.',
    );
    expect(screen.queryByText('Alice member card')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob member card')).not.toBeInTheDocument();
    expect(screen.queryByText('No members available for this project')).not.toBeInTheDocument();
    axios.get.mockRejectedValueOnce(new Error('Still offline'));
    rerender(view('a'));
    expect(
      await screen.findByText('Unable to refresh members. Showing previously loaded data.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Alice member card')).toBeVisible();
  });

  it('does not present previously empty data as a confirmed empty result after failure', async () => {
    axios.get.mockResolvedValueOnce({ data: { members: [] } });
    const { store } = setup();
    await screen.findByText('No members available for this project');
    axios.get.mockRejectedValueOnce(new Error('Offline'));
    await act(async () => {
      await store.dispatch(fetchBMProjectMembers('a'));
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load members. Please try again.',
    );
    expect(screen.queryByText('No members available for this project')).not.toBeInTheDocument();
  });

  it.each(['Error starting time log', 'Unable to load project list'])(
    'does not turn shared error %s into a member-fetch failure',
    async message => {
      axios.get.mockResolvedValueOnce({ data: { members } });
      const { store } = setup();
      await screen.findByText('Found 2 out of 2 members');
      act(() => {
        store.dispatch({ type: GET_ERRORS, payload: { message } });
      });
      expect(screen.getByText('Unrelated timer error')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
      expect(
        screen.queryByText('Unable to load members. Please try again.'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Found 2 out of 2 members')).toBeInTheDocument();
    },
  );

  it('keeps the actual project selector visible and unchanged through failed loading and retry', async () => {
    axios.get.mockRejectedValueOnce(new Error('Offline'));
    setup({ page: true });
    const selector = screen.getByRole('combobox');
    fireEvent.change(selector, { target: { value: 'b' } });
    expect(
      await screen.findByText('Unable to load members. Please try again.'),
    ).toBeInTheDocument();
    expect(selector).toBeVisible();
    expect(selector).toHaveValue('b');
    let resolve;
    axios.get.mockReturnValueOnce(
      new Promise(done => {
        resolve = done;
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(selector).toHaveValue('b');
    expect(screen.getByText('Loading project members...')).toBeInTheDocument();
    await act(async () => {
      resolve({ data: { members } });
    });
    expect(screen.getByText('Found 2 out of 2 members')).toBeInTheDocument();
    expect(selector).toHaveValue('b');
    expect(axios.get.mock.calls.every(([url]) => url.endsWith('/bm/project/b/users'))).toBe(true);
  });
});
