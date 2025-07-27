import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import AssignBadge from 'components/Badge/AssignBadge';

const mockStore = configureStore([thunk]);

const mockAllBadgeData = [
  { _id: '1', badgeName: '30 HOURS 3-WEEK STREAK' },
  { _id: '2', badgeName: 'LEAD A TEAM OF 40+ (Trailblazer)' },
];

const mockUserProfilesData = [
  {
    _id: 'user1',
    firstName: 'Jerry',
    lastName: 'Volunteer1',
    email: 'jerryvolunteer1@gmail.com',
  },
  {
    _id: 'user2',
    firstName: 'Jerry',
    lastName: 'Volunteer2',
    email: 'jerryvolunteer2@gmail.com',
  },
];

describe('AssignBadge component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      badge: {
        firstName: '',
        lastName: '',
        selectedBadges: ['Badge 1', 'Badge 2'],
      },
      allUserProfiles: {
        userProfiles: mockUserProfilesData,
      },
      theme: { darkMode: false },
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <AssignBadge allBadgeData={mockAllBadgeData} />
      </Provider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
  });

  it('renders the search input and label', () => {
    renderComponent();
    expect(screen.getByText('Search by Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
  });

  it('displays correct number of selected badges', () => {
    renderComponent();
    const alertText = screen.getByRole('alert').textContent;
    expect(alertText).toContain('2 badge(s) selected');
  });

  it('filters and displays users based on search input', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Full Name');
    fireEvent.change(input, { target: { value: 'Jerry' } });

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(3); // 2 users + header row
    });
  });

  it('allows selecting users and updates the count', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Full Name');
    fireEvent.change(input, { target: { value: 'Jerry' } });

    await waitFor(() => {
      const userRows = screen.getAllByRole('row').slice(1); // Exclude header row
      fireEvent.click(userRows[0]);
    });

    const alertText = screen.getByRole('alert').textContent;
    expect(alertText).toContain('1 user(s) selected');
  });

  it('disables Assign Badge button when no users are selected', () => {
    renderComponent();
    expect(screen.getByText('Assign Badge')).toBeDisabled();
  });

  it('enables Assign Badge button when users are selected', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Full Name');
    fireEvent.change(input, { target: { value: 'Jerry' } });

    await waitFor(() => {
      const userRows = screen.getAllByRole('row').slice(1); // Exclude header row
      fireEvent.click(userRows[0]);
    });

    expect(screen.getByText('Assign Badge')).toBeEnabled();
  });
});
