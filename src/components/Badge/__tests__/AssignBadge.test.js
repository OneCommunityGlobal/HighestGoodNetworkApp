import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AssignBadge from 'components/Badge/AssignBadge';
import { Provider } from 'react-redux';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureStore([thunk]);

const mockallBadgeData = [
  { _id: '1', badgeName: '30 HOURS 3-WEEK STREAK' },
  { _id: '2', badgeName: 'LEAD A TEAM OF 40+ (Trailblazer)' },
];

const mockUserProfilesData = [
  {
    permissions: {
      frontPermissions: ['getWeeklySummaries', 'seeUserManagement'],
      backPermissions: [],
    },
    isActive: true,
    weeklycommittedHours: 50,
    role: 'Volunteer',
    firstName: 'jerry',
    lastName: 'volunteer1',
    email: 'jerryvolunteer1@gmail.com',
    _id: 'user1',
  },
  {
    permissions: {
      frontPermissions: ['editTimeEntry', 'toggleTangibleTime'],
      backPermissions: [],
    },
    isActive: true,
    weeklycommittedHours: 10,
    role: 'Volunteer',
    firstName: 'jerry',
    lastName: 'volunteer2',
    email: 'jerryvolunteer2@gmail.com',
    _id: 'user2',
  },
];

jest.mock('../../../actions/userManagement', () => ({
  getAllUserProfile: jest.fn(),
}));

jest.mock('../../../actions/badgeManagement', () => ({
  getFirstName: jest.fn(),
  getLastName: jest.fn(),
  getUserId: jest.fn(),
  clearNameAndSelected: jest.fn(),
  assignBadgesByUserID: jest.fn(),
  assignBadges: jest.fn(),
  getBadgesByUserId: jest.fn(),
  validateBadges: jest.fn(),
  closeAlert: jest.fn(),
}));

describe('AssignBadge component', () => {
  let store;

  beforeEach(() => {
    // Reset the mocks
    jest.clearAllMocks();

    // Set up our mock implementations
    const userManagement = require('../../../actions/userManagement');
    const badgeManagement = require('../../../actions/badgeManagement');

    // Mock getAllUserProfile to return a thunk
    userManagement.getAllUserProfile.mockImplementation(() => dispatch => {
      dispatch({ type: 'USER_PROFILES_FETCH_START' });
      dispatch({ type: 'USER_PROFILES_FETCH_COMPLETE', payload: mockUserProfilesData });
      return Promise.resolve(mockUserProfilesData);
    });

    // Mock other actions to return plain objects
    badgeManagement.getFirstName.mockImplementation(name => ({
      type: 'GET_FIRST_NAME',
      payload: name,
    }));
    badgeManagement.getLastName.mockImplementation(name => ({
      type: 'GET_LAST_NAME',
      payload: name,
    }));
    badgeManagement.getUserId.mockImplementation(id => ({ type: 'GET_USER_ID', payload: id }));
    badgeManagement.clearNameAndSelected.mockImplementation(() => ({
      type: 'CLEAR_NAME_AND_SELECTED',
    }));
    badgeManagement.assignBadgesByUserID.mockImplementation(() => () => Promise.resolve());
    badgeManagement.assignBadges.mockImplementation(() => () => Promise.resolve());
    badgeManagement.getBadgesByUserId.mockImplementation(() => () => Promise.resolve([]));
    badgeManagement.closeAlert.mockImplementation(() => ({ type: 'CLOSE_ALERT' }));
    badgeManagement.validateBadges.mockImplementation(() => () => Promise.resolve());

    store = mockStore({
      badge: {
        firstName: '',
        lastName: '',
        selectedBadges: ['Badge 1', 'Badge 2'],
      },
      allUserProfiles: {
        userProfiles: mockUserProfilesData,
        fetching: false,
        fetched: true,
      },
      theme: themeMock,
    });

    // Override dispatch to handle thunks
    const originalDispatch = store.dispatch;
    store.dispatch = jest.fn(action => {
      if (typeof action === 'function') {
        return action(originalDispatch);
      }
      return originalDispatch(action);
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <AssignBadge allBadgeData={mockallBadgeData} />
      </Provider>,
    );
  };

  it('Renders without crashing', () => {
    renderComponent();
  });

  it('Renders the Label element', () => {
    renderComponent();
    const searchInput = screen.getByText('Search by Full Name');
    expect(searchInput).toBeInTheDocument();
  });

  it('Renders the full name input', async () => {
    renderComponent();
    const inputFullNameElement = screen.getByPlaceholderText('Full Name');
    expect(inputFullNameElement).toBeInTheDocument();
  });

  it('Renders user list based on full name search', async () => {
    renderComponent();
    const inputFullNameElement = screen.getByPlaceholderText('Full Name');

    fireEvent.change(inputFullNameElement, { target: { value: 'jerry' } });

    const userRows = await screen.findAllByRole('row', { name: /jerry/ });
    expect(userRows.length).toBe(2);
  });

  it('Renders the Assign Badge button', () => {
    renderComponent();
    const buttonElement = screen.getByText('Assign Badge');
    expect(buttonElement).toBeInTheDocument();
  });

  it('Renders the tool tip hover message', async () => {
    renderComponent();

    const tooltip = screen.getByTestId('NameInfo');
    fireEvent.mouseEnter(tooltip);

    const tip1 =
      'Start typing a name and a list of the active members (matching what you type) will be auto-generated. Then you........ CHOOSE ONE!';
    const tip2 =
      'After selecting a person, click "Assign Badge" and choose one or multiple badges. Click "confirm" then "submit" and those badges will be assigned.';

    const message1 = await screen.findByText(tip1);
    const message2 = await screen.findByText(tip2);

    expect(message1).toBeInTheDocument();
    expect(message2).toBeInTheDocument();
  });

  it('2 badges selected message appears', async () => {
    renderComponent();
    const numOfBadges = screen.getByText('2 badges selected');
    expect(numOfBadges).toBeInTheDocument();
  });
});
