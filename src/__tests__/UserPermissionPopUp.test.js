import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';  // You may need to mock axios calls

import UserPermissionsPopUp from './UserPermissionsPopUp';

jest.mock('axios');  // Mocking axios for testing purposes

describe('UserPermissionsPopUp', () => {
  const allUserProfiles = [
    { _id: '1', firstName: 'John', lastName: 'Doe', role: 'Admin' },
    { _id: '2', firstName: 'Jane', lastName: 'Doe', role: 'User' },
    // Add more user profiles for testing
  ];

  const roles = [
    { roleName: 'Admin', permissions: ['PermissionA', 'PermissionB'] },
    { roleName: 'User', permissions: ['PermissionC', 'PermissionD'] },
    // Add more roles for testing
  ];

  beforeEach(() => {
    axios.get.mockReset();  // Reset the mock between tests
    axios.put.mockReset();
  });

  it('renders the component with default state', () => {
    render(<UserPermissionsPopUp allUserProfiles={allUserProfiles} roles={roles} />);
    // Add assertions for default rendering
  });

  it('handles empty user profile', async () => {
    render(<UserPermissionsPopUp allUserProfiles={[]} roles={roles} />);
    // Add assertions for how the component handles an empty user profile
  });

  it('handles empty roles', async () => {
    render(<UserPermissionsPopUp allUserProfiles={allUserProfiles} roles={[]} />);
    // Add assertions for how the component handles empty roles
  });

  it('resets permissions to default', async () => {
    // Render the component with a specific user profile
    render(<UserPermissionsPopUp allUserProfiles={allUserProfiles} roles={roles} />);
    // Trigger the "Reset to Default" button
    userEvent.click(screen.getByText('Reset to Default'));
    // Add assertions to check that permissions are reset
  });

  it('selects a user and updates permissions', async () => {
    // Mock asynchronous axios calls
    axios.get.mockResolvedValueOnce({ data: allUserProfiles[0] });
    axios.put.mockResolvedValueOnce({ data: {} });

    render(<UserPermissionsPopUp allUserProfiles={allUserProfiles} roles={roles} />);
    
    // Type into the search input
    userEvent.type(screen.getByRole('textbox'), 'John Doe');
    await waitFor(() => screen.getByText('John Doe'));

    // Select the user
    userEvent.click(screen.getByText('John Doe'));

    // Add assertions to check that user data is updated
  });

  // Add more test cases based on the mentioned scenarios

});
