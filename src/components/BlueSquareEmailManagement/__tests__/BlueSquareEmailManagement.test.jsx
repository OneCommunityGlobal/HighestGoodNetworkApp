import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import BlueSquareEmailManagement from '../BlueSquareEmailManagement';

const mockStore = configureStore([]);

// Mock the actions
jest.mock('../../../actions/blueSquareEmailActions', () => ({
  resendBlueSquareEmails: jest.fn(() => () => Promise.resolve()),
  resendWeeklySummaryEmails: jest.fn(() => () => Promise.resolve()),
}));

// Mock the permission utility
jest.mock('../../../utils/permissions', () => {
  return jest.fn(() => () => true); // Default to true for testing
});

describe('BlueSquareEmailManagement', () => {
  let store;

  const createMockStore = (authState = {}, darkMode = false) => {
    return mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          userid: 'test-user',
          role: 'Administrator',
          permissions: {
            frontPermissions: ['resendBlueSquareAndSummaryEmails']
          }
        },
        firstName: 'Test',
        ...authState
      },
      theme: {
        darkMode
      },
      role: {
        roles: []
      }
    });
  };

  beforeEach(() => {
    store = createMockStore();
  });

  const renderComponent = (storeState = store) => {
    return render(
      <Provider store={storeState}>
        <BrowserRouter>
          <BlueSquareEmailManagement />
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders the component with correct title', () => {
    renderComponent();
    
    expect(screen.getByText('Blue Square Email Management')).toBeInTheDocument();
  });

  it('renders both email trigger buttons', () => {
    renderComponent();
    
    expect(screen.getByText('Resend Blue Square Emails')).toBeInTheDocument();
    expect(screen.getByText('Resend Weekly Summary Email')).toBeInTheDocument();
  });

  it('shows confirmation modal when Blue Square button is clicked', () => {
    renderComponent();
    
    const blueSquareButton = screen.getByText('Resend Blue Square Emails');
    fireEvent.click(blueSquareButton);
    
    expect(screen.getByText('Confirm Blue Square Email Resend')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to resend Blue Square emails/)).toBeInTheDocument();
  });

  it('shows confirmation modal when Weekly Summary button is clicked', () => {
    renderComponent();
    
    const weeklySummaryButton = screen.getByText('Resend Weekly Summary Email');
    fireEvent.click(weeklySummaryButton);
    
    expect(screen.getByText('Confirm Weekly Summary Email Resend')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to trigger resend/)).toBeInTheDocument();
  });

  it('shows access denied when user lacks permission', () => {
    // Mock permission to return false
    const mockHasPermission = require('../../../utils/permissions');
    mockHasPermission.mockImplementation(() => () => false);
    
    renderComponent();
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/You do not have permission to access/)).toBeInTheDocument();
  });

  it('renders info icon with tooltip', () => {
    renderComponent();
    
    const infoIcon = screen.getByRole('img', { hidden: true });
    expect(infoIcon).toBeInTheDocument();
  });

  it('handles dark mode styling', () => {
    const darkModeStore = createMockStore({}, true);
    renderComponent(darkModeStore);
    
    const container = screen.getByText('Blue Square Email Management').closest('.blue-square-email-management');
    expect(container).toHaveClass('dark-mode');
  });
}); 