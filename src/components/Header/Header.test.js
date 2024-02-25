import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Header from './Header'; // Adjust the import path as necessary

// Mocking module dependencies
jest.mock('../../actions/authActions', () => ({
  getHeaderData: jest.fn(),
}));
jest.mock('../../actions/role', () => ({
  getAllRoles: jest.fn(),
}));
jest.mock('../../utils/permissions', () => ({
  hasPermission: jest.fn(() => true), // Adjust based on what you need to test
  cantUpdateDevAdminDetails: jest.fn(() => false),
}));

const mockStore = configureStore([]);
const initialState = {
  auth: {
    isAuthenticated: true,
    user: { userid: '1', role: 'Owner' },
    firstName: 'John',
    profilePic: '/path/to/image',
  },
  userProfile: {
    email: 'test@example.com',
  },
  taskEditSuggestionCount: 5,
  role: {
    roles: [],
  },
};

describe('Header Component', () => {
  let store;
  let component;

  beforeEach(() => {
    store = mockStore(initialState);
    component = render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
  });

  it('should render without crashing', () => {
    expect(component).toBeTruthy();
  });

  it('shows modal for specific roles and conditions', async () => {
    const { queryByText } = component;
    // Assuming the modal's content includes specific text based on the role
    await waitFor(() => expect(queryByText(/If you are seeing this, it’s because you are on a team!/)).toBeInTheDocument());
  });

  it('renders navigation links based on permissions', () => {
    const { queryByText } = component;
    // Adjust the expectations based on permissions
    expect(queryByText('Dashboard')).toBeInTheDocument();
    expect(queryByText('User Management')).toBeInTheDocument();
  });

  // Add more tests as needed
});
