import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { Provider } from 'react-redux';
import { vi } from 'vitest';

// --- Mock Data ---
const mockUserProfilesData = [
  {
    _id: 'user1',
    firstName: 'jerry',
    lastName: 'volunteer1',
    permissions: {
      frontPermissions: ['getWeeklySummaries', 'seeUserManagement'],
      backPermissions: [],
    },
    isActive: true,
    weeklycommittedHours: 50,
    role: 'Volunteer',
    email: 'jerryvolunteer1@gmail.com',
  },
  {
    _id: 'user2',
    firstName: 'jerry',
    lastName: 'volunteer2',
    permissions: { frontPermissions: ['editTimeEntry', 'toggleTangibleTime'], backPermissions: [] },
    isActive: true,
    weeklycommittedHours: 10,
    role: 'Volunteer',
    email: 'jerryvolunteer2@gmail.com',
  },
];

const mockAllBadgeData = [
  { _id: '1', badgeName: '30 HOURS 3-WEEK STREAK' },
  { _id: '2', badgeName: 'LEAD A TEAM OF 40+ (Trailblazer)' },
];

vi.mock('../../../actions/userManagement', () => ({
  __esModule: true,
  getAllUserProfile: vi.fn(() => dispatch => {
    dispatch({ type: 'USER_PROFILES_FETCH_START' });
    dispatch({ type: 'USER_PROFILES_FETCH_COMPLETE', payload: mockUserProfilesData });
    return Promise.resolve(mockUserProfilesData);
  }),
}));

vi.mock('../../../actions/badgeManagement', () => ({
  __esModule: true,
  getFirstName: vi.fn(),
  getLastName: vi.fn(),
  getUserId: vi.fn(),
  clearNameAndSelected: vi.fn(() => () => {}),
  assignBadgesByUserID: vi.fn(() => () => Promise.resolve()),
  assignBadges: vi.fn(() => () => Promise.resolve()),
  getBadgesByUserId: vi.fn(() => () => Promise.resolve([])),
  validateBadges: vi.fn(() => () => Promise.resolve()),
  closeAlert: vi.fn(() => () => {}),
}));

import AssignBadge from '../AssignBadge';

const mockStore = configureStore([thunk]);

describe('AssignBadge component', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();

    store = mockStore({
      auth: { user: {} },
      badge: {
        selectedBadges: ['Badge 1', 'Badge 2'],
        firstName: '',
        lastName: '',
        userId: null,
        message: '',
        alertVisible: false,
        color: '',
      },
      allUserProfiles: {
        userProfiles: mockUserProfilesData,
        fetching: false,
        fetched: true,
      },
      theme: { darkMode: false },
    });

    const origDispatch = store.dispatch;
    store.dispatch = vi.fn(action =>
      typeof action === 'function' ? action(origDispatch) : origDispatch(action),
    );
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <AssignBadge allBadgeData={mockAllBadgeData} />
      </Provider>,
    );

  it('renders without crashing', () => {
    renderComponent();
  });

  it('renders label and input', () => {
    renderComponent();
    expect(screen.getByText('Search by Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
  });

  it('filters user list based on input', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'jerry' } });
    const rows = await screen.findAllByRole('row', { name: /jerry/i });
    expect(rows).toHaveLength(2);
  });

  it('disables the Assign Badge button until a user is selected', () => {
    renderComponent();
    expect(screen.getByText('Assign Badge')).toBeDisabled();
  });

  it('shows tooltip messages on hover', async () => {
    renderComponent();
    fireEvent.mouseEnter(screen.getByTestId('NameInfo'));
    expect(
      await screen.findByText(/Start typing a name and a list of the active members/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/After selecting a person, click "Assign Badge"/),
    ).toBeInTheDocument();
  });

  it('displays the count of badges selected', () => {
    renderComponent();
    expect(screen.getByText('2 badges selected')).toBeInTheDocument();
  });
});
