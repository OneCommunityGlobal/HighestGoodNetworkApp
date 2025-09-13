// Teams.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Teams } from '../Teams'; 
import { toast } from 'react-toastify';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock the actions and other dependencies
vi.mock('../../../actions/allTeamsAction', () => ({
  getAllUserTeams: vi.fn(),
  postNewTeam: vi.fn(),
  deleteTeam: vi.fn(),
  updateTeam: vi.fn(),
  getTeamMembers: vi.fn(),
  deleteTeamMember: vi.fn(),
  addTeamMember: vi.fn(),
  updateTeamMemeberVisibility: vi.fn(),
}));

vi.mock('../../../actions/userManagement', () => ({
  getAllUserProfile: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('utils/search', () => ({
  searchWithAccent: vi.fn((text, searchText) => text.includes(searchText)),
}));

// Mock subcomponents to prevent rendering them
vi.mock('../TeamsOverview', () => ({ default: 'TeamOverview' }));
vi.mock('../TeamTableSearchPanel', () => ({ default: 'TeamTableSearchPanel' }));
vi.mock('../TeamMembersPopup', () => ({ default: 'TeamMembersPopup' }));
vi.mock('../CreateNewTeamPopup', () => ({ default: 'CreateNewTeamPopup' }));
vi.mock('../DeleteTeamPopup', () => ({ default: 'DeleteTeamPopup' }));
vi.mock('../TeamStatusPopup', () => ({ default: 'TeamStatusPopup' }));
vi.mock('../Team', () => ({ default: 'Team' }));
vi.mock('../../common/Loading', () => ({ default: () => <div>Loading</div> }));

describe('Teams Component', () => {
  let props;
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        allTeamsData: (state = { fetching: false, allTeams: [] }, action) => state,
        theme: (state = { darkMode: false }, action) => state,
        teamsTeamMembers: (state = { teamMembers: [], fetching: false }, action) => state,
        allUserProfiles: (state = [], action) => state,
        role: (state = { roles: [] }, action) => state,
        userProfile: (state = { role: 'Owner' }, action) => state,
        auth: (state = { user: { role: 'Owner' } }, action) => state,
      },
    });

    props = {
      state: {
        allTeamsData: {
          allTeams: [],
          fetching: false,
        },
        theme: {
          darkMode: false,
        },
        teamsTeamMembers: {
          teamMembers: [],
          fetching: false,
        },
        allUserProfiles: [],
      },
      getAllUserTeams: vi.fn(),
      getAllUserProfile: vi.fn(),
      postNewTeam: vi.fn(),
      deleteTeam: vi.fn(),
      updateTeam: vi.fn(),
      getTeamMembers: vi.fn(),
      deleteTeamMember: vi.fn(),
      addTeamMember: vi.fn(),
      updateTeamMemeberVisibility: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('should render without crashing', () => {
    renderWithProvider(<Teams {...props} />);
    expect(screen.getByText('Teams')).toBeInTheDocument();
  });

  it('should render Loading component when fetching is true', () => {
    props.state.allTeamsData.fetching = true;
    renderWithProvider(<Teams {...props} />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
