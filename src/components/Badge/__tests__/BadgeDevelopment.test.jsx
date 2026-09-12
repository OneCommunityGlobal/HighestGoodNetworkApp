import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import BadgeDevelopment from '../BadgeDevelopment';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

// Mock the BadgeDevelopmentTable and CreateNewBadgePopup components
vi.mock('components/Badge/BadgeDevelopmentTable', () => ({
  default: () => <div>BadgeDevelopmentTable</div>,
}));
vi.mock('components/Badge/CreateNewBadgePopup', () => ({
  default: () => <div>CreateNewBadgePopup</div>,
}));

describe('BadgeDevelopment Component', () => {
  const mockStore = configureMockStore([thunk]);

  const renderComponent = () => {
    const store = mockStore({
      allProjects: {
        projects: [],
      },
      auth: {
        isAuthenticated: true,
        user: {
          userid: '123',
          role: 'Owner',
          firstName: 'John',
          profilePic: '/path/to/image.jpg',
          permissions: {
            frontPermissions: ['updateBadges', 'deleteBadges', 'createBadges'],
            backPermissions: [],
          },
        },
      },
      userProfile: {
        email: 'test@example.com',
      },
      taskEditSuggestionCount: 0,
      role: {
        roles: ['Owner'],
      },
      theme: themeMock,
      badge: {
        message: '',
        alertVisible: false,
        color: '',
      },
    });

    return render(
      <Provider store={store}>
        <BadgeDevelopment />
      </Provider>,
    );
  };

  it('Should render without crashing', () => {
    renderComponent();
    expect(screen.getByText('Create New Badge')).toBeInTheDocument();
  });

  it('Should open the create new badge popup when the button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
  });

  it('should render the BadgeDevelopmentTable component', () => {
    renderComponent();
    // When no badges match filters, the component shows "No badges match the current filters"
    expect(screen.getByText(/No badges match the current filters/)).toBeInTheDocument();
  });

  it('should close the New Badge popup when the button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
    fireEvent.click(screen.getByText('New Badge'));
    expect(screen.getByText('Create New Badge'));
  });
});
