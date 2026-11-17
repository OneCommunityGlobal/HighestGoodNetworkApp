import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import BMTimeLogCard from '../BMTimeLogCard';
import BMTimeLogStopWatch from '../BMTimeLogStopWatch';
import {
  groupMembers,
  getRoleGroups,
  getTeamGroups,
  NO_ROLE_LABEL,
  NO_TEAM_LABEL,
} from '../groupMembers';
import { bmTimeLoggerReducer } from '../../../../reducers/bmdashboard/timeLoggerReducer';

vi.mock('axios');
vi.mock('../BMTimeLogSummary', () => ({ default: () => <div data-testid="history-table" /> }));
vi.mock('../BMTimeLogStopWatch', async importOriginal => {
  const actual = await importOriginal();
  return { default: vi.fn(actual.default) };
});

const PROJECT_ID = 'project1';

const makeMember = (id, firstName, teams = [], role = 'Volunteer') => ({
  user: { _id: id, firstName, lastName: 'Test', role, teams },
});
const teamA = { _id: 'teamA', teamName: 'Team A' };
const teamB = { _id: 'teamB', teamName: 'Team B' };
const members = [
  makeMember('ann', 'Ann', [teamA]),
  makeMember('bob', 'Bob', [teamB]),
  makeMember('cat', 'Cat', [teamA, teamB]),
  makeMember('dan', 'Dan', [], 'Owner'),
];

const bulkResponse = overrides => ({
  data: { started: [], resumed: [], alreadyCheckedIn: [], failed: [], ...overrides },
});

const setupCard = (allLogs = []) => {
  const store = createStore(
    combineReducers({
      bmTimeLogger: bmTimeLoggerReducer,
      errors: () => ({}),
      bmProjectMembers: () => ({ members }),
    }),
    {
      bmTimeLogger: {
        bmTimeLogs: {},
        bmTimeLogHistory: [],
        allProjectTimeLogs: { [PROJECT_ID]: allLogs },
      },
    },
    applyMiddleware(thunk),
  );
  render(
    <Provider store={store}>
      <BMTimeLogCard selectedProject={PROJECT_ID} />
    </Provider>,
  );
  return store;
};

const memberCheckbox = name => screen.getAllByRole('checkbox', { name: `Select ${name} Test` })[0];
const checkInButton = () => screen.getByRole('button', { name: /Check In Selected Members/ });

describe('BMTimeLogCard bulk check-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: { members } });
    BMTimeLogStopWatch.mockImplementation(() => <div data-testid="stopwatch" />);
  });

  it('disables the check-in button until a member is selected', async () => {
    setupCard();

    expect(checkInButton()).toBeDisabled();
    await userEvent.click(memberCheckbox('Ann'));

    expect(checkInButton()).toBeEnabled();
    expect(checkInButton()).toHaveTextContent('(1)');
  });

  it('selects and deselects every visible member', async () => {
    setupCard();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));
    expect(checkInButton()).toHaveTextContent('(4)');

    await userEvent.click(screen.getByRole('checkbox', { name: 'Deselect All' }));
    expect(checkInButton()).toHaveTextContent('(0)');
  });

  it('limits Select All to search results and keeps hidden selections', async () => {
    setupCard();

    await userEvent.click(memberCheckbox('Dan'));
    await userEvent.type(screen.getByPlaceholderText(/Search by name/), 'team a');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select All' }));

    expect(checkInButton()).toHaveTextContent('(3)');
    expect(screen.getByText('1 selected not shown by search')).toBeInTheDocument();
  });

  it('sends the selection and clears members that checked in', async () => {
    axios.post.mockResolvedValue(
      bulkResponse({
        started: [{ memberId: 'ann', timeLog: { _id: 'log1', status: 'ongoing' } }],
        alreadyCheckedIn: [{ memberId: 'bob', timeLog: { _id: 'log2', status: 'ongoing' } }],
      }),
    );
    const store = setupCard();

    await userEvent.click(memberCheckbox('Ann'));
    await userEvent.click(memberCheckbox('Bob'));
    await userEvent.click(checkInButton());

    expect(await screen.findByText('Checked in 1. 1 already checked in.')).toBeInTheDocument();
    expect(axios.post.mock.calls[0][1]).toEqual({ memberIds: ['ann', 'bob'] });
    expect(checkInButton()).toHaveTextContent('(0)');
    expect(store.getState().bmTimeLogger.bmTimeLogs[`ann_${PROJECT_ID}`].status).toBe('ongoing');
  });

  it('names failed members and keeps them selected for a retry', async () => {
    axios.post.mockResolvedValue(
      bulkResponse({
        started: [{ memberId: 'ann', timeLog: { _id: 'log1', status: 'ongoing' } }],
        failed: [{ memberId: 'bob', message: 'write failed' }],
      }),
    );
    setupCard();

    await userEvent.click(memberCheckbox('Ann'));
    await userEvent.click(memberCheckbox('Bob'));
    await userEvent.click(checkInButton());

    expect(await screen.findByText('Checked in 1. Failed: Bob Test.')).toBeInTheDocument();
    expect(checkInButton()).toHaveTextContent('(1)');
    expect(memberCheckbox('Bob')).toBeChecked();
  });

  it('keeps the selection and shows an error when the request fails', async () => {
    axios.post.mockRejectedValue({ response: { data: { message: 'Project not found' } } });
    setupCard();

    await userEvent.click(memberCheckbox('Ann'));
    await userEvent.click(checkInButton());

    expect(await screen.findByText('Project not found')).toBeInTheDocument();
    await waitFor(() => expect(checkInButton()).toBeEnabled());
    expect(checkInButton()).toHaveTextContent('(1)');
  });

  it('groups by team, shows multi-team members in each group and shares their selection', async () => {
    setupCard();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'team');

    expect(screen.getByRole('button', { name: /Team A \(2\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Team B \(2\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /No Team \(1\)/ })).toBeInTheDocument();

    const catCheckboxes = screen.getAllByRole('checkbox', { name: 'Select Cat Test' });
    expect(catCheckboxes).toHaveLength(2);
    await userEvent.click(catCheckboxes[0]);
    expect(catCheckboxes[1]).toBeChecked();
    expect(checkInButton()).toHaveTextContent('(1)');
  });

  it('groups by role', async () => {
    setupCard();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'role');

    expect(screen.getByRole('button', { name: /Owner \(1\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volunteer \(3\)/ })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox', { name: /^Select .* Test$/ })).toHaveLength(4);
  });

  it('keeps cards mounted when a group is collapsed', async () => {
    setupCard();
    await userEvent.selectOptions(screen.getByRole('combobox'), 'team');
    const stopwatchCount = screen.getAllByTestId('stopwatch').length;

    const header = screen.getByRole('button', { name: /Team A \(2\)/ });
    await userEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getAllByTestId('stopwatch')).toHaveLength(stopwatchCount);
  });

  it('hides a success message after 5 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      axios.post.mockResolvedValue(
        bulkResponse({
          started: [{ memberId: 'ann', timeLog: { _id: 'log1', status: 'ongoing' } }],
        }),
      );
      setupCard();

      await userEvent.click(memberCheckbox('Ann'));
      await userEvent.click(checkInButton());
      expect(await screen.findByText('Checked in 1.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

      act(() => vi.advanceTimersByTime(5000));
      await waitFor(() => expect(screen.queryByText('Checked in 1.')).not.toBeInTheDocument());
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps a failure message until it is closed', async () => {
    axios.post.mockResolvedValue(
      bulkResponse({ failed: [{ memberId: 'bob', message: 'write failed' }] }),
    );
    setupCard();

    await userEvent.click(memberCheckbox('Bob'));
    await userEvent.click(checkInButton());
    expect(await screen.findByText('Checked in 0. Failed: Bob Test.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByText('Checked in 0. Failed: Bob Test.')).not.toBeInTheDocument(),
    );
  });

  it('counts active logs in the summary and each member once in the totals', () => {
    setupCard([
      { status: 'ongoing', member: { _id: 'cat' } },
      { status: 'paused', member: { _id: 'ann' } },
      { status: 'completed', member: { _id: 'bob' } },
      { status: 'ongoing', member: { _id: 'not-on-project' } },
    ]);

    const summaryBox = screen.getByTestId('check-in-summary');
    const summary = within(summaryBox);
    expect(summaryBox).toHaveTextContent('Checked in: 2');
    expect(summaryBox).toHaveTextContent('Remaining: 2');
    expect(summary.getByText('Team A: 2/2')).toBeInTheDocument();
    expect(summary.getByText('Team B: 1/2')).toBeInTheDocument();
    expect(summary.getByText('No Team: 0/1')).toBeInTheDocument();
    expect(summary.getByText('Volunteer: 2/3')).toBeInTheDocument();
    expect(summary.getByText('Owner: 0/1')).toBeInTheDocument();
  });
});

describe('BMTimeLogStopWatch after a bulk check-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('runs when started outside the card, even after an earlier stop', async () => {
    const { default: ActualStopWatch } = await vi.importActual('../BMTimeLogStopWatch');
    const key = `ann_${PROJECT_ID}`;
    const store = createStore(
      combineReducers({ bmTimeLogger: bmTimeLoggerReducer }),
      {
        bmTimeLogger: {
          bmTimeLogs: { [key]: { _id: 'log1', status: 'ongoing', totalElapsedTime: 0 } },
          bmTimeLogHistory: [],
          allProjectTimeLogs: {},
        },
      },
      applyMiddleware(thunk),
    );
    axios.post.mockResolvedValue({
      data: { timeLog: { _id: 'log1', status: 'completed', totalElapsedTime: 0 } },
    });
    render(
      <Provider store={store}>
        <ActualStopWatch projectId={PROJECT_ID} memberId="ann" />
      </Provider>,
    );

    await waitFor(() => expect(store.getState().bmTimeLogger.bmTimeLogs[key]).toBeTruthy());
    store.dispatch({
      type: 'BULK_START_TIME_LOGS',
      payload: {
        timeLogs: [
          {
            _id: 'log1',
            status: 'ongoing',
            totalElapsedTime: 0,
            memberId: 'ann',
            projectId: PROJECT_ID,
          },
        ],
      },
    });
    const stopButton = await screen.findByRole('button', { name: 'STOP' });
    await waitFor(() => expect(stopButton).toBeEnabled());
    await userEvent.click(stopButton);
    await waitFor(() => expect(stopButton).toBeDisabled());

    store.dispatch({
      type: 'BULK_START_TIME_LOGS',
      payload: {
        timeLogs: [
          {
            _id: 'log2',
            status: 'ongoing',
            totalElapsedTime: 0,
            currentIntervalStarted: new Date().toISOString(),
            memberId: 'ann',
            projectId: PROJECT_ID,
          },
        ],
      },
    });

    expect(await screen.findByRole('button', { name: 'PAUSE' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'STOP' })).toBeEnabled());
  });
});

describe('groupMembers', () => {
  it('sorts groups by label and puts members without a team last', () => {
    const groups = groupMembers(members, getTeamGroups);

    expect(groups.map(group => group.label)).toEqual(['Team A', 'Team B', NO_TEAM_LABEL]);
    expect(groups[0].members.map(member => member.user.firstName)).toEqual(['Ann', 'Cat']);
  });

  it('treats teams without a name as no team', () => {
    expect(getTeamGroups(makeMember('eve', 'Eve', ['rawTeamId', null]))).toEqual([
      { key: NO_TEAM_LABEL, label: NO_TEAM_LABEL, isFallback: true },
    ]);
  });

  it('puts members without a role in a No Role group listed last', () => {
    const groups = groupMembers(
      [makeMember('eve', 'Eve', [], ''), makeMember('fay', 'Fay', [], 'Mentor')],
      getRoleGroups,
    );

    expect(groups.map(group => group.label)).toEqual(['Mentor', NO_ROLE_LABEL]);
  });
});
