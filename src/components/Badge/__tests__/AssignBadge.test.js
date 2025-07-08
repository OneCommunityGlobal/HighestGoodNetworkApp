import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AssignBadge from 'components/Badge/AssignBadge';
import { Provider } from 'react-redux';
import { badgeReducer } from 'reducers/badgeReducer';
import { GET_FIRST_NAME, GET_LAST_NAME } from 'constants/badge';
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

const store = mockStore({
  badge: {
    firstName: '',
    lastName: '',
    selectedBadges: ['Badge 1', 'Badge 2'],
  },
  allUserProfiles: {
    userProfiles: mockUserProfilesData,
  },
  theme: themeMock,
});

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <AssignBadge allBadgeData={mockallBadgeData} />
    </Provider>,
  );
};

beforeEach(() => {
  store.clearActions();
});

describe('AssignBadge component', () => {
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
