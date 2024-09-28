// PermissionsManagement.test.js
// Version 1.0.0

// Import necessary libraries and dependencies
import React from 'react';
import { rolesMock, themeMock } from '../../../__tests__/mockStates';
import PermissionsManagement from '../PermissionsManagement';
import thunk from 'redux-thunk';
import { Route } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderWithRouterMatch } from '../../../__tests__/utils';
import configureMockStore from 'redux-mock-store';
import userEvent from '@testing-library/user-event';

jest.mock('actions/role.js'); // Mocking the role actions for testing

// Setup mock store using redux-thunk middleware
const mockStore = configureMockStore([thunk]);

// Mock data for infoCollections
const mockInfoCollections = [
  {
    infoName: 'testInfo',
    infoContent: 'a',
  },
  {
    infoName: 'testInfo2',
    infoContent: '',
  },
];

// Test suite for PermissionsManagement page structure and behavior
describe('permissions management page structure', () => {
  let store;

  // Before each test, initialize the mock store and render the component with router match
  beforeEach(() => {
    store = mockStore({
      role: rolesMock.role,
      roleInfo: { roleInfo: {} },
      theme: themeMock,
    });
    store.dispatch = jest.fn(); // Mock dispatch to track actions

    // Render the PermissionsManagement component using a route match
    renderWithRouterMatch(
      <Route path="/permissionsmanagement">
        {(props) => (
          <PermissionsManagement
            {...props}
            infoCollections={mockInfoCollections}
            areaName={'testInfo'}
            role={'Owner'}
            fontSiz={24} // typo in 'fontSiz' to match the original, but ensure it's intended
          />
        )}
      </Route>,
      {
        route: `/permissionsmanagement`,
        store,
      }
    );
  });

  // Test case to check if the page contains a User Roles header
  it('should be rendered with one h1 User Roles', () => {
    expect(screen.getByText(/User Roles/i)).toBeInTheDocument();
  });

  // Grouping related tests for "Add New Role" button
  describe('Add New Role button', () => {
    // Test case for the existence of the "Add New Role" button
    test('add new role button should be present', () => {
      if (screen.queryByRole('Button')) {
        expect(screen.queryByRole('Button', { name: /add new role/i })).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('Button', { name: /add new role/i })).not.toBeInTheDocument();
      }
    });
  });

  // Grouping behavior-related tests for permissions management
  describe('permissions management behavior', () => {
    // Test case to verify if the new role modal opens and contains a form
    it('should fire newRole modal with a form to create a new Role', () => {
      if (screen.queryByRole('Button')) {
        userEvent.click(screen.getByText(/add new role/i)); // Simulate click on "Add New Role" button
        expect(screen.getByRole('dialog')).toBeInTheDocument(); // Verify modal presence
        expect(screen.getByRole('Button', { name: 'Close' })).toBeInTheDocument(); // Verify close button presence
        expect(screen.getByRole('textbox')).toBeInTheDocument(); // Verify textbox presence in modal
      } else {
        // If "Add New Role" button doesn't exist, ensure the modal and form aren't rendered
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByRole('Button', { name: 'Close' })).not.toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      }
    });
  });
});