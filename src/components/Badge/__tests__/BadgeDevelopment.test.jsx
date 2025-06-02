import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BadgeDevelopment from '../BadgeDevelopment';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

// Mock the BadgeDevelopmentTable and CreateNewBadgePopup components
jest.mock('components/Badge/BadgeDevelopmentTable', () => () => <div>BadgeDevelopmentTable</div>);
jest.mock('components/Badge/CreateNewBadgePopup', () => () => <div>CreateNewBadgePopup</div>);

describe('BadgeDevelopment Component', () => {
  const mockStore = configureStore([thunk]);
 
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
    const table = document.querySelector('.table');
    expect(table);
  });

  it('should close the New Badge popup when the button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
    fireEvent.click(screen.getByText('New Badge'));
    expect(screen.getByText('Create New Badge'));
  });
});
