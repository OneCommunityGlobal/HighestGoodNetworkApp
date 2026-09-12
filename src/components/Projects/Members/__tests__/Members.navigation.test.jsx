import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import axios from 'axios';
import Projects from '../../Projects';
import Members from '../Members';
import { projectMembershipReducer } from '~/reducers/projectMembershipReducer';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');
vi.mock('../../AddProject', () => ({ default: () => null }));
vi.mock('~/utils/permissions', () => ({ default: () => () => false }));
vi.mock('~/actions/projects', () => ({
  fetchAllProjects: () => () => {},
  fetchAllArchivedProjects: () => () => {},
  modifyProject: () => () => {},
  clearError: () => () => {},
}));
vi.mock('~/components/UserProfile/EditableModal/EditableInfoModal', () => ({
  default: () => null,
}));

const project = {
  _id: 'project1', projectName: 'Test Project', category: 'Society', isActive: true,
};
const member = { _id: 'user1', firstName: 'Jane', lastName: 'Member', isActive: true };

function renderNavigation(initialPath = '/projects') {
  const store = createStore(combineReducers({
    projectMembers: projectMembershipReducer,
    allProjects: (state = { projects: [project], status: 200, fetched: true, fetching: false }) => state,
    theme: (state = { darkMode: false }) => state,
    userProfile: (state = { role: 'Manager' }) => state,
    projectById: (state = { projectName: project.projectName }) => state,
  }), applyMiddleware(thunk));
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Switch>
          <Route exact path="/projects" component={Projects} />
          <Route path="/project/members/:projectId" component={Members} />
        </Switch>
      </MemoryRouter>
    </Provider>,
  );
  return { store };
}

function membersLink() {
  return screen.getAllByRole('link').find(
    link => link.getAttribute('href') === `/project/members/${project._id}`,
  );
}

describe('Projects to Members navigation', () => {
  let resolveMembers;

  beforeEach(() => {
    axios.get.mockReset();
    axios.get.mockImplementation(url => {
      if (url === ENDPOINTS.PROJECTS_WITH_ACTIVE_USERS) {
        return Promise.resolve({ data: { project1: 1 } });
      }
      if (url === ENDPOINTS.PROJECT_MEMBER(project._id)) {
        return new Promise(resolve => { resolveMembers = resolve; });
      }
      if (url === ENDPOINTS.PROJECT_BY_ID(project._id)) return Promise.resolve({ data: project });
      if (url === ENDPOINTS.USER_PROFILES) return Promise.resolve({ data: [] });
      throw new Error(`Unexpected request: ${url}`);
    });
  });

  it.each(['success', 'failure'])('opens Members after a count request %s', async outcome => {
    if (outcome === 'failure') axios.get.mockRejectedValueOnce(new Error('Count request failed'));
    const { store } = renderNavigation();
    await waitFor(() => {
      if (outcome === 'success') {
        expect(store.getState().projectMembers.activeMemberCounts).toEqual({ project1: 1 });
      } else {
        expect(store.getState().projectMembers.error.message).toBe('Count request failed');
      }
    });

    fireEvent.click(membersLink());
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.PROJECT_MEMBER(project._id));
    await act(async () => { resolveMembers({ data: [member] }); });
    expect(await screen.findByText('Jane Member')).toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();

    const backLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/projects/');
    fireEvent.click(backLink);
    expect(await screen.findByText('Projects')).toBeInTheDocument();
    expect(membersLink()).toBeInTheDocument();
  });

  it('loads Members on direct entry with fresh state', async () => {
    renderNavigation(`/project/members/${project._id}`);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    await act(async () => { resolveMembers({ data: [member] }); });
    expect(await screen.findByText('Jane Member')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalledWith(ENDPOINTS.PROJECTS_WITH_ACTIVE_USERS);
  });
});
