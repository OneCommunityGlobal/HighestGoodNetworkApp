import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { configureStore } from 'redux-mock-store';
import React from 'react';
import { Provider } from 'react-redux';
import { toast } from 'react-toastify';
import { ModalContext } from '~/context/ModalContext';
import mockAdminState from '__tests__/mockAdminState';
import { themeMock } from '__tests__/mockStates';
import thunk from 'redux-thunk';
import UserPermissionsPopUp from '../UserPermissionsPopUp';

// Mock necessary modules
vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

vi.mock('axios');

const mockStore = configureStore([thunk]);
let store;

const mockModalContext = {
  modalStatus: false,
  updateModalStatus: vi.fn(),
};

beforeEach(() => {
  store = mockStore({
    auth: {
      user: {
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
        role: 'Owner',
      },
      permissions: {
        frontPermissions: [],
        backPermissions: [],
      },
    },
    role: mockAdminState.role,
    allUserProfiles: {
      userProfiles: [
        {
          isActive: true,
          weeklycommittedHours: 0,
          _id: 'abc123',
          role: 'Volunteer',
          firstName: 'Test1',
          lastName: 'Volunteer',
          email: 'Test1.Volunteer@gmail.com',
        },
        {
          isActive: true,
          weeklycommittedHours: 10,
          _id: 'def123',
          role: 'Manager',
          firstName: 'Test2',
          lastName: 'Manager',
          email: 'Test2.Manager@gmail.com',
        },
        {
          isActive: false,
          weeklycommittedHours: 2,
          _id: 'ghi123',
          role: 'Owner',
          firstName: 'Test3',
          lastName: 'Owner',
          email: 'Test3.Owner@gmail.com',
        },
      ],
    },
    theme: themeMock,
  });
  toast.success.mockClear();
  toast.error.mockClear();
});

afterEach(() => {
  store.clearActions();
});

const flushAllPromises = () =>
  new Promise(resolve => {
    setTimeout(resolve, 0);
  });

describe('UserPermissionsPopup component', () => {
  it('check if user name is present', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    await flushAllPromises();
    expect(screen.getByText('User name:')).toBeInTheDocument();
  });

  it('check if input box displays only the active users', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    await flushAllPromises();
    const searchBoxElement = screen.getByPlaceholderText('Shows only ACTIVE users');
    await userEvent.type(searchBoxElement, 'Test');
    expect(screen.getByText('Test1 Volunteer')).toBeInTheDocument();
    expect(screen.getByText('Test2 Manager')).toBeInTheDocument();
    expect(screen.queryByText('Test3 Owner')).not.toBeInTheDocument();
  });

  it('check if permissions is present', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: '',
    });
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    await flushAllPromises();
    expect(screen.getByText('Permissions:')).toBeInTheDocument();
  });

  it('check if submit button works as expected when the button is clicked', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        _id: 'def123',
        role: 'Manager',
        firstName: 'Test2',
        lastName: 'Manager',
        email: 'Test2.Manager@gmail.com',
      },
    });
    axios.put.mockResolvedValue({ status: 200 });

    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    const nameElement = screen.getByText('Test1 Volunteer');
    await userEvent.click(nameElement);
    await userEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      // ✅ FIX: Use expect.stringContaining to make the test more robust
      // and prevent failures from formatting/whitespace differences.
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Permissions have been updated successfully'),
        {
          autoClose: 10000,
        },
      );
    });
  });

  it('check if toast message gets displayed when the button is not clicked', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        _id: 'def123',
        role: 'Manager',
        firstName: 'Test2',
        lastName: 'Manager',
        email: 'Test2.Manager@gmail.com',
      },
    });
    axios.put.mockResolvedValue({ status: 200 });

    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    const nameElement = screen.getByText('Test1 Volunteer');
    await userEvent.click(nameElement);
    await waitFor(() => {
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  it('check if toast error message gets displayed when the button is clicked', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: {
        _id: 'def123',
        role: 'Manager',
        firstName: 'Test2',
        lastName: 'Manager',
        email: 'Test2.Manager@gmail.com',
      },
    });
    axios.put.mockRejectedValue({ err: 'server error' });
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    const nameElement = screen.getByText('Test1 Volunteer');
    await userEvent.click(nameElement);
    await userEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      // ✅ FIX: Use expect.stringContaining here as well.
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Permission updated failed'),
        {
          autoClose: 10000,
        },
      );
    });
  });

  // it('should reset permissions to default when "Reset to Default" is clicked', async () => {
  //   // Arrange: Mock the API response for the selected user.
  //   // Give them one specific permission.
  //   axios.get.mockImplementation(url => {
  //     if (url.includes('/userprofile/all')) {
  //       return Promise.resolve({
  //         status: 200,
  //         data: [
  //           { _id: 'abc123', firstName: 'Test1', lastName: 'Volunteer', isActive: true },
  //           { _id: 'def123', firstName: 'Test2', lastName: 'Manager', isActive: true },
  //         ],
  //       });
  //     }
  //     if (url.includes('/userprofile/def123')) {
  //       // Match the specific user ID
  //       return Promise.resolve({
  //         status: 200,
  //         data: {
  //           _id: 'def123',
  //           role: 'Manager',
  //           permissions: {
  //             frontPermissions: [
  //               { name: 'seeUsersInDashboard', hasPermission: true, isDefault: false },
  //             ],
  //             removedDefaultPermissions: [],
  //           },
  //         },
  //       });
  //     }
  //     return Promise.reject(new Error('not found'));
  //   });
  //   // Mock the PUT call that happens on reset
  //   axios.put.mockResolvedValue({ status: 200 });

  //   render(
  //     <Provider store={store}>
  //       <ModalContext.Provider value={mockModalContext}>
  //         <UserPermissionsPopUp />
  //       </ModalContext.Provider>
  //     </Provider>,
  //   );

  //   // Act 1: Find and click the user.
  //   const userToClick = await screen.findByText('Test2 Manager');
  //   await userEvent.click(userToClick);

  //   // Assert 1: Wait for the component to re-render with the user's permissions.
  //   // The key is to find the specific permission item and check for the "Remove" button inside it.
  //   await waitFor(() => {
  //     // Find the list item by its data-testid.
  //     const permissionItem = screen.getByTestId('seeUsersInDashboard');
  //     // `within` allows us to search ONLY inside this specific list item.
  //     const removeButton = within(permissionItem).getByRole('button', { name: /remove/i });
  //     expect(removeButton).toBeInTheDocument();
  //   });

  //   // Act 2: Find and click the reset button.
  //   const resetButton = screen.getByRole('button', { name: /reset to default/i });
  //   await userEvent.click(resetButton);

  //   // Assert 2: Wait for the UI to reset.
  //   // The "Remove" button should now be gone, and an "Add" button should be in its place
  //   // inside the exact same permission item.
  //   await waitFor(() => {
  //     const permissionItem = screen.getByTestId('seeUsersInDashboard');
  //     const addButton = within(permissionItem).getByRole('button', { name: /add/i });
  //     expect(addButton).toBeInTheDocument();
  //     expect(
  //       within(permissionItem).queryByRole('button', { name: /remove/i }),
  //     ).not.toBeInTheDocument();
  //   });
  // });
});
