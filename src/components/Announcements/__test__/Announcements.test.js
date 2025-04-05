// src/components/__tests__/Announcements.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import Announcements from '../index.jsx';

// Mock external dependencies
jest.mock('@tinymce/tinymce-react', () => ({
  Editor: () => <div>Mock TinyMCE Editor</div>,
}));
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));
jest.mock('../../../actions/sendEmails', () => ({
  sendEmail: jest.fn(() => ({ type: 'SEND_EMAIL' })),
  broadcastEmailsToAll: jest.fn(() => ({ type: 'BROADCAST_EMAILS' })),
}));
jest.mock('../../../utils/URL.js', () => ({
  ENDPOINTS: {
    UPLOAD_IMAGE: () => '/api/upload-image',
  },
}));

// Configure mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Announcements Component - Tab Toggling', () => {
  let store;

  beforeEach(() => {
    // Set up the mock store with initial state
    store = mockStore({
      theme: {
        darkMode: false,
      },
    });

    // Mock localStorage for token
    localStorage.setItem('jwtToken', 'mock-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // Helper to render the component with Redux provider
  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <Announcements title="Weekly Progress Editor" email="" {...props} />
      </Provider>
    );
  };

  it('toggles between Weekly Progress Update and Non-Formatted tabs correctly', () => {
    renderComponent();

    // Check that Weekly Progress Update tab is active by default
    expect(screen.getByText('Weekly Progress Update')).toHaveClass('active');
    expect(screen.queryByText('Mock TinyMCE Editor')).not.toBeInTheDocument();

    // Switch to Non-Formatted tab
    fireEvent.click(screen.getByRole('button', { name: /non-formatted/i }));
    expect(screen.getByText('Non-Formatted')).toHaveClass('active');
    expect(screen.queryByText('Use the fields below to build the weekly progress update.')).not.toBeInTheDocument();

    // Switch back to Weekly Progress Update tab
    fireEvent.click(screen.getByRole('button', { name: /weekly progress update/i }));
    expect(screen.getByText('Weekly Progress Update')).toHaveClass('active');
    expect(screen.queryByText('Mock TinyMCE Editor')).not.toBeInTheDocument();
  });
});