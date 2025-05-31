// eslint-disable-next-line no-unused-vars
/* eslint-disable react/jsx-props-no-spreading */

// import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom'; // ✅ Router wrapper required
import { localReducers, sessionReducers } from '../../../reducers';
import mockAdminState from '../../../__tests__/mockAdminState';
import Leaderboard from '../Leaderboard';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

const rootReducer = combineReducers({
  ...localReducers,
  ...sessionReducers,
});
const store = createStore(rootReducer, applyMiddleware(thunk));

describe('Leaderboard page structure', () => {
  let mountedLeaderboard;
  let props;

  beforeEach(() => {
    props = {
      organizationData: { weeklyCommittedHours: 0, tangibletime: 0, totaltime: 0 },
      getLeaderboardData: jest.fn(),
      getOrgData: jest.fn(), // ✅ required
      getMouseoverText: jest.fn(), // ✅ required
      getWeeklySummaries: jest.fn(), // ✅ required
      setFilteredUserTeamIds: jest.fn(), // ✅ required
      showTimeOffRequestModal: jest.fn(), // ✅ required
      loggedInUser: { role: 'Admin' },
      loading: true,
      isVisible: true,
      darkMode: true,
      leaderBoardData: mockAdminState.leaderBoardData,
      timeEntries: [],
      displayUserId: '123',
    };

    mountedLeaderboard = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Leaderboard {...props} />
        </Provider>
      </MemoryRouter>,
    );
  });

  it('should be rendered with a table', () => {
    const table = mountedLeaderboard.find('Table');
    expect(table.length).toBe(1);
  });

  it('should be rendered with 6 Headers', () => {
    const tableHeader = mountedLeaderboard.find('thead');
    expect(tableHeader.length).toBe(1);
    const tableHeads = tableHeader.find('th');
    expect(tableHeads.length).toBe(7);
  });

  it('should render with dark mode styles when darkMode prop is true', () => {
    expect(mountedLeaderboard.find('.dark-mode').length).toBeGreaterThan(0);
  });

  it('should display an alert if the user is invisible', () => {
    props.isVisible = false;
    mountedLeaderboard = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Leaderboard {...props} isVisible={false} />
        </Provider>
      </MemoryRouter>,
    );
    expect(mountedLeaderboard.find('Alert').exists()).toBe(true);
  });

  it('renders a search input', () => {
    expect(mountedLeaderboard.find('input[type="text"]').exists()).toBe(true);
  });

  it('renders the progress component for each user', () => {
    props.leaderBoardData = [{ personId: 1, name: 'John Doe', tangibletime: 10, totaltime: 20 }];
    mountedLeaderboard = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Leaderboard {...props} />
        </Provider>
      </MemoryRouter>,
    );
    expect(mountedLeaderboard.find('Progress').length).toBeGreaterThan(0);
  });

  it('should not render admin features if loggedInUser role is not Admin', () => {
    props.loggedInUser = { role: 'User' };
    mountedLeaderboard = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Leaderboard {...props} />
        </Provider>
      </MemoryRouter>,
    );
    expect(mountedLeaderboard.find('.admin-features').exists()).toBe(false);
  });
});
