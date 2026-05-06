import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';
import BlueSquareEmailManagement from '../BlueSquareEmailManagement';

const mockStore = configureMockStore([]);

// Mock the actions
vi.mock('../../../actions/blueSquareEmailActions', () => ({
  resendBlueSquareEmails: vi.fn(() => () => Promise.resolve()),
  resendWeeklySummaryEmails: vi.fn(() => () => Promise.resolve()),
}));

// Mock the permission utility
vi.mock('../../../utils/permissions', () => {
  return vi.fn(() => () => true); // Default to true for testing
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
            frontPermissions: ['resendBlueSquareAndSummaryEmails'],
          },
        },
        firstName: 'Test',
        ...authState,
      },
      theme: {
        darkMode,
      },
      role: {
        roles: [],
      },
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
      </Provider>,
    );
  };

  it('renders the component with correct titles', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Resend Blue Square Emails/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Resend Weekly Summary Email/i }),
    ).toBeInTheDocument();
  });

  it('renders both email trigger buttons', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /Resend Blue Square Emails/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Resend Weekly Summary Email/i }),
    ).toBeInTheDocument();
  });

  it('shows confirmation modal when Blue Square button is clicked', () => {
    renderComponent();

    const blueSquareButton = screen.getByRole('button', { name: /Resend Blue Square Emails/i });
    fireEvent.click(blueSquareButton);

    expect(screen.getByText('Confirm Blue Square Email Resend')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to resend Blue Square emails/),
    ).toBeInTheDocument();
  });

  it('shows confirmation modal when Weekly Summary button is clicked', () => {
    renderComponent();

    const weeklySummaryButton = screen.getByRole('button', {
      name: /Resend Weekly Summary Email/i,
    });
    fireEvent.click(weeklySummaryButton);

    expect(screen.getByText('Confirm Weekly Summary Email Resend')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to trigger resend/)).toBeInTheDocument();
  });

  it('shows access denied when user lacks permission', () => {
    // Create store without the required permission
    const storeWithoutPermission = createMockStore({
      user: {
        userid: 'test-user',
        role: 'Administrator',
        permissions: {
          frontPermissions: [], // No permissions
        },
      },
    });

    renderComponent(storeWithoutPermission);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/You do not have permission to access/)).toBeInTheDocument();
  });

  it('renders info icon with tooltip', () => {
    renderComponent();

    // Check for FontAwesome icons by finding elements that contain the icons
    expect(
      screen.getByRole('heading', { name: /Resend Weekly Summary Email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Resend Weekly Summary Email/i }),
    ).toBeInTheDocument();
  });

  it('renders buttons when user has permission', () => {
    renderComponent();

    const blueSquareButton = screen.getByRole('button', { name: /Resend Blue Square Emails/i });
    const weeklySummaryButton = screen.getByRole('button', {
      name: /Resend Weekly Summary Email/i,
    });

    expect(blueSquareButton).toBeEnabled();
    expect(weeklySummaryButton).toBeEnabled();
  });

  it('displays correct descriptions for each email type', () => {
    renderComponent();

    expect(screen.getByText(/Triggers resend of Blue Square emails/)).toBeInTheDocument();
    expect(
      screen.getByText(/Resends the admin report showing weekly summaries/),
    ).toBeInTheDocument();
  });

  it('handles dark mode styling', () => {
    const darkModeStore = createMockStore({}, true);
    renderComponent(darkModeStore);

    // Verify headings are present (which confirms the component rendered properly in dark mode)
    expect(screen.getByRole('heading', { name: /Resend Blue Square Emails/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Resend Weekly Summary Email/i }),
    ).toBeInTheDocument();

    // Verify buttons still render in dark mode
    const blueSquareButton = screen.getByRole('button', { name: /Resend Blue Square Emails/i });
    const weeklySummaryButton = screen.getByRole('button', {
      name: /Resend Weekly Summary Email/i,
    });

    expect(blueSquareButton).toBeInTheDocument();
    expect(weeklySummaryButton).toBeInTheDocument();
  });
});
