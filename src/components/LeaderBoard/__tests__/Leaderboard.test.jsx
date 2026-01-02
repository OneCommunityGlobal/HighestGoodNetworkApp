// eslint-disable-next-line no-unused-vars
vi.mock('../../../actions/leaderBoardData', () => ({
  getOrgData: vi.fn(),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import mockAdminState from '../../../__tests__/mockAdminState';
import Leaderboard from '../Leaderboard';
import { MemoryRouter } from 'react-router-dom';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockUser = {
  userid: '123',
  firstName: 'Test User',
  profilePic: 'test-pic.jpg',
};

const mockState = {
  auth: {
    user: mockUser,
    loggedInUser: { role: 'Admin' },
    firstName: 'Test',
    profilePic: 'test-pic',
  },
  leaderBoardData: mockAdminState.leaderBoardData,
  orgData: mockAdminState.organizationData,
  theme: { darkMode: true },
  infoCollections: { infoCollections: [] },
};

global.getMouseoverText = vi.fn();

const originalUseEffect = React.useEffect;
vi.spyOn(React, 'useEffect').mockImplementation((callback, deps) => {
  if (callback.toString().includes('getMouseoverText')) return;
  return originalUseEffect(callback, deps);
});

describe('Leaderboard page structure', () => {
  let store;
  let props;

  beforeEach(() => {
    store = mockStore(mockState);
    store.dispatch = vi.fn().mockImplementation(() => ({ type: 'MOCKED_ACTION' }));

    props = {
      ...mockAdminState,
      organizationData: { weeklyCommittedHours: 0, tangibletime: 0, totaltime: 0 },
      getLeaderboardData: vi.fn(),
      getOrgData: vi.fn(),
      loggedInUser: { role: 'Admin' },
      loading: false,
      darkMode: true,
      leaderBoardData: [
        { personId: 1, name: 'John Doe', tangibletime: 10, totaltime: 20, role: 'User' },
        { personId: 2, name: 'Jane Smith', tangibletime: 15, totaltime: 25, role: 'Admin' },
      ],
      isVisible: false,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui, options) =>
    render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>,
      options,
    );

  it('renders without crashing', () => {
    expect(() => renderWithProvider(<Leaderboard {...props} />)).not.toThrow();
  });

  it('renders a table', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders 7 table headers', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBe(7);
  });

  it('renders dark mode styles if enabled', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const darkStyledElements = screen.getAllByTestId(/dark-mode/i);
    expect(darkStyledElements.length).toBeGreaterThan(0);
  });

  it('shows alert when user is invisible', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders progressbars for users', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('does not render admin features for non-admin users', () => {
    const userProps = { ...props, loggedInUser: { role: 'User' } };
    renderWithProvider(<Leaderboard {...userProps} />);
    const adminOnly = screen.queryByTestId('admin-features');
    expect(adminOnly).not.toBeInTheDocument();
  });

  it('renders at least one row of leaderboard data', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // header + data rows
  });

  it('displays the "Leaderboard" title', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const title = screen.getByText(/Leaderboard/i);
    expect(title).toBeInTheDocument();
  });

  it('displays correct Total Time label and value', () => {
    renderWithProvider(<Leaderboard {...props} />);
    const header = screen.getByText(content => content === 'Total Time' || content === 'Tot. Time');
    expect(header).toBeInTheDocument();

    const timeValue = screen.getByTitle('Tangible + Intangible time = Total time');
    expect(timeValue).toBeInTheDocument();
    expect(timeValue.textContent).toContain('0.00');
  });
});
