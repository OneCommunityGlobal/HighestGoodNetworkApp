import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';
import CreateNewRolePopup from '../CreateNewRolePopup';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CreateNewRolePopup component', () => {
  const mockRoleNames = ['Admin', 'User', 'Manager'];

  beforeEach(() => {
    render(<CreateNewRolePopup toggle={() => {}} roleNames={mockRoleNames} />);
  });

  test('renders CreateNewRolePopup component', () => {
    expect(screen.getByLabelText('Role Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Permissions:')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('handles role name input correctly', () => {
    const roleNameInput = screen.getByPlaceholderText('Please enter a new role name');

    fireEvent.change(roleNameInput, { target: { value: 'NewRole' } });

    expect(roleNameInput.value).toBe('NewRole');
    expect(screen.queryByText('Please enter a role name')).toBeNull(); // Error message should not be displayed

    fireEvent.change(roleNameInput, { target: { value: 'Admin' } });

    expect(screen.getByText('Please enter a different role name')).toBeInTheDocument();
  });

  test('handles permission checkbox correctly', () => {
    const permissionCheckbox = screen.getByLabelText('Admin');

    fireEvent.click(permissionCheckbox);

    expect(permissionCheckbox.checked).toBe(true);

    fireEvent.click(permissionCheckbox);

    expect(permissionCheckbox.checked).toBe(false);
  });

  test('submits the form successfully', async () => {
    const roleNameInput = screen.getByPlaceholderText('Please enter a new role name');
    const createButton = screen.getByText('Create');

    fireEvent.change(roleNameInput, { target: { value: 'NewRole' } });
    fireEvent.click(screen.getByLabelText('Admin'));
    fireEvent.click(createButton);

    // Wait for the asynchronous actions to complete
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Role created successfully');
    });

    // You can add additional assertions based on your component's behavior
  });

  // Add more test cases based on the component's functionality
});
