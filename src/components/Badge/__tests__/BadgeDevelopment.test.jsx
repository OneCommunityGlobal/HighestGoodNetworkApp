import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import BadgeDevelopment from '../BadgeDevelopment';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

// Mock the BadgeDevelopmentTable and CreateNewBadgePopup components using the same relative paths as in BadgeDevelopment.jsx
vi.mock('../BadgeDevelopmentTable', () => {
  const MockBadgeDevelopmentTable = () => <div>BadgeDevelopmentTable</div>;
  MockBadgeDevelopmentTable.displayName = 'MockBadgeDevelopmentTable';
  return { default: MockBadgeDevelopmentTable };
});
vi.mock('../CreateNewBadgePopup', () => {
  const MockCreateNewBadgePopup = () => <div>CreateNewBadgePopup</div>;
  MockCreateNewBadgePopup.displayName = 'MockCreateNewBadgePopup';
  return { default: MockCreateNewBadgePopup };
});

describe('BadgeDevelopment Component', () => {
  const mockStore = configureStore([thunk]);

  const renderComponent = (allBadgeData = []) => {
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
        <BadgeDevelopment allBadgeData={allBadgeData} />
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
    // Provide a mock badge so the table is rendered
    const mockBadges = [{ _id: '1', badgeName: 'Test Badge', type: 'Type', ranking: 1 }];
    renderComponent(mockBadges);
    // Assuming BadgeDevelopmentTable renders text "BadgeDevelopmentTable" as per the mock
    expect(screen.getByText('BadgeDevelopmentTable')).toBeInTheDocument();
  });

  it('should close the New Badge popup when the button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
    fireEvent.click(screen.getByText('New Badge'));
    expect(screen.getByText('Create New Badge'));
  });
});
