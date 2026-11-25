import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router, Route, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import BMTimeLogger from '../BMTimeLogger';
import { fetchBMProjectMembers } from '../../../../actions/bmdashboard/projectMemberAction';

vi.mock('../../../../actions/bmdashboard/projectActions', () => ({
  fetchBMProjects: () => ({ type: 'TEST_FETCH_BM_PROJECTS' }),
}));

vi.mock('../../../../actions/bmdashboard/projectMemberAction', () => ({
  fetchBMProjectMembers: vi.fn(),
}));

// These children fetch their own data; they are not under test here.
vi.mock('../BMTimeLogSummary', () => ({
  default: ({ projectId }) => <div data-testid="timelog-summary">{projectId}</div>,
}));

vi.mock('../BMTimeLogDisplayMember', () => ({
  default: ({ firstName, lastName }) => (
    <div data-testid="member-card">
      {firstName} {lastName}
    </div>
  ),
}));

const PROJECT_A = '507f1f77bcf86cd799439011';
const PROJECT_B = '507f1f77bcf86cd799439022';

const mockProjects = [
  { _id: PROJECT_A, name: 'Project A' },
  { _id: PROJECT_B, name: 'Project B' },
];

const mockMembers = [
  { user: { _id: 'u1', firstName: 'Jane', lastName: 'Doe', role: 'Volunteer', teams: [] } },
  { user: { _id: 'u2', firstName: 'John', lastName: 'Smith', role: 'Manager', teams: [] } },
];

const mockStore = configureMockStore([thunk]);

const membersResult = result => () => () => Promise.resolve(result);

const renderAt = path => {
  const history = createMemoryHistory({ initialEntries: [path] });
  const store = mockStore({ bmProjects: mockProjects, errors: {} });
  render(
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route path="/bmdashboard/timelog" exact component={BMTimeLogger} />
          <Route path="/bmdashboard/timelog/:projectId" exact component={BMTimeLogger} />
        </Switch>
      </Router>
    </Provider>,
  );
  return { history };
};

describe('BMTimeLogger (Member Group Check In)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchBMProjectMembers.mockImplementation(membersResult({ ok: true, members: mockMembers }));
  });

  it('shows the project dropdown and no member cards when no project is in the URL', () => {
    renderAt('/bmdashboard/timelog');

    expect(screen.getByText('Member Group Check In')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(fetchBMProjectMembers).not.toHaveBeenCalled();
  });

  it('loads the member cards for the project in the URL', async () => {
    renderAt(`/bmdashboard/timelog/${PROJECT_A}`);

    expect(screen.getByRole('combobox')).toHaveValue(PROJECT_A);
    expect(await screen.findAllByTestId('member-card')).toHaveLength(2);
    expect(fetchBMProjectMembers).toHaveBeenCalledWith(PROJECT_A);
  });

  it('updates the URL when a project is selected', async () => {
    const { history } = renderAt('/bmdashboard/timelog');

    await userEvent.selectOptions(screen.getByRole('combobox'), PROJECT_B);

    expect(history.location.pathname).toBe(`/bmdashboard/timelog/${PROJECT_B}`);
    expect(await screen.findAllByTestId('member-card')).toHaveLength(2);
  });

  it('keeps the page and the cards on a valid route after searching and clearing', async () => {
    const { history } = renderAt(`/bmdashboard/timelog/${PROJECT_A}`);
    await screen.findAllByTestId('member-card');

    const search = screen.getByPlaceholderText('Search by name, role, or team...');
    await userEvent.type(search, 'jane');

    expect(screen.getAllByTestId('member-card')).toHaveLength(1);
    expect(history.location.pathname).toBe(`/bmdashboard/timelog/${PROJECT_A}`);

    await userEvent.clear(search);
    await userEvent.type(search, 'zzzz');
    expect(screen.getByText('No members found matching "zzzz"')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getAllByTestId('member-card')).toHaveLength(2);
    expect(history.location.pathname).toBe(`/bmdashboard/timelog/${PROJECT_A}`);
  });

  it('shows a not-found message for a project that does not exist', async () => {
    fetchBMProjectMembers.mockImplementation(
      membersResult({ ok: false, error: { response: { status: 404 } } }),
    );

    renderAt(`/bmdashboard/timelog/${PROJECT_A}`);

    expect(await screen.findByRole('alert')).toHaveTextContent('This project was not found');
    expect(screen.getByText('Member Group Check In')).toBeInTheDocument();
  });

  it('shows an invalid-link message for a malformed project ID', async () => {
    fetchBMProjectMembers.mockImplementation(
      membersResult({ ok: false, error: { response: { status: 400 } } }),
    );

    renderAt('/bmdashboard/timelog/123');

    expect(await screen.findByRole('alert')).toHaveTextContent('This project link is not valid');
  });

  it('lets the user retry after a failed load', async () => {
    fetchBMProjectMembers
      .mockImplementationOnce(membersResult({ ok: false, error: { response: { status: 500 } } }))
      .mockImplementation(membersResult({ ok: true, members: mockMembers }));

    renderAt(`/bmdashboard/timelog/${PROJECT_A}`);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load the members for this project.',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(screen.getAllByTestId('member-card')).toHaveLength(2));
    expect(fetchBMProjectMembers).toHaveBeenCalledTimes(2);
  });
});
