vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { themeMock } from '__tests__/mockStates';
import { ModalContext, ModalProvider } from '~/context/ModalContext';
import UserPermissionsPopUp from '../UserPermissionsPopUp';

const mockStore = configureMockStore([thunk]);
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

vi.mock('axios');

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
    fireEvent.change(searchBoxElement, { target: { value: 'Test' } });
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
    axios.patch.mockResolvedValue({ status: 200 });

    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    const nameElement = screen.getByText('Test1 Volunteer');
    fireEvent.click(nameElement);
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        `
            Permissions have been updated successfully. 
            Please inform the user to log out and log back in for the new permissions to take effect.`,
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
    axios.patch.mockResolvedValue({ status: 200 });

    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    const nameElement = screen.getByText('Test1 Volunteer');
    fireEvent.click(nameElement);
    await waitFor(() => {
      expect(toast.success).not.toHaveBeenCalledWith(
        `
            Permissions have been updated successfully. 
            Please inform the user to log out and log back in for the new permissions to take effect.`,
        {
          autoClose: 10000,
        },
      );
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
    axios.patch.mockRejectedValue({ err: 'server error' });
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    const mockObject = {};
    const nameElement = screen.getByText('Test1 Volunteer');
    fireEvent.click(nameElement);

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `
          Permission update failed. ${mockObject}
        `,
        {
          autoClose: 10000,
        },
      );
    });
  });
  it.skip('should reset permissions to default when "Reset to Default" is clicked', async () => {
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        _id: 'ghi123',
        role: 'Owner',
        firstName: 'Test3',
        lastName: 'Owner',
        email: 'Test3.Owner@gmail.com',
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
      },
    });

    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );

    // Select user
    fireEvent.click(screen.getByText('Test2 Manager'));

    // Wait for initial "Add" buttons to appear
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /add/i }).length).toBeGreaterThan(0);
    });

    // Save the number of "Add" buttons before clicking
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    const initialCount = addButtons.length;

    // Add permission (click one "Add" button)
    fireEvent.click(addButtons[0]);

    // Wait for the UI to update (e.g., "Add" should be removed or reduced)
    await waitFor(() => {
      const newAddButtons = screen.queryAllByRole('button', { name: /add/i });
      expect(newAddButtons.length).toBeLessThan(initialCount);
    });

    // Click "Reset to Default"
    // Click "Reset to Default"
    fireEvent.click(screen.getByRole('button', { name: /reset to default/i }));

    // Wait until at least one "Add" button is visible again (default permissions shown)
    await waitFor(() => {
      const addButtons = screen.queryAllByRole('button', { name: /add/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });
}, 10000);

describe('UserPermissionsPopup unsaved changes', () => {
  const REMINDER = 'Remember to Save Your Changes!';
  const savedUser = {
    _id: 'abc123',
    role: 'Volunteer',
    firstName: 'Test1',
    lastName: 'Volunteer',
    email: 'Test1.Volunteer@gmail.com',
    permissions: { frontPermissions: [], removedDefaultPermissions: [] },
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ status: 200, data: savedUser });
  });

  // The signed-in user may edit user permissions, so the Add/Delete buttons are enabled
  const allowEditing = () => {
    const state = store.getState();
    store = mockStore({
      ...state,
      auth: {
        ...state.auth,
        user: {
          ...state.auth.user,
          permissions: { frontPermissions: ['putUserProfilePermissions'], backPermissions: [] },
        },
      },
    });
  };

  it('shows the reminder only while the permissions differ from the saved ones', async () => {
    allowEditing();
    // Real ModalProvider; the parent page passes modalStatus down the same way
    render(
      <Provider store={store}>
        <ModalProvider>
          <ModalContext.Consumer>
            {({ modalStatus }) => <UserPermissionsPopUp modalStatus={modalStatus} />}
          </ModalContext.Consumer>
        </ModalProvider>
      </Provider>,
    );
    fireEvent.click(screen.getByText('Test1 Volunteer'));
    await flushAllPromises();
    expect(screen.queryByText(REMINDER)).not.toBeInTheDocument();

    fireEvent.click(within(screen.getByTestId('postRole')).getByRole('button', { name: 'Add' }));
    expect(await screen.findByText(REMINDER)).toBeInTheDocument();

    // Removing the same permission again leaves nothing to save
    fireEvent.click(within(screen.getByTestId('postRole')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByText(REMINDER)).not.toBeInTheDocument());
  });

  it('clears the flag and closes the pop-up after a successful Submit', async () => {
    allowEditing();
    axios.patch.mockResolvedValue({ status: 200 });
    const updateModalStatus = vi.fn();
    const closePopUp = vi.fn();
    render(
      <Provider store={store}>
        <ModalContext.Provider value={{ modalStatus: false, updateModalStatus }}>
          <UserPermissionsPopUp closePopUp={closePopUp} getChangeLogs={vi.fn()} />
        </ModalContext.Provider>
      </Provider>,
    );
    fireEvent.click(screen.getByText('Test1 Volunteer'));
    await flushAllPromises();
    // A real change first, so the flag is on when Submit is pressed
    fireEvent.click(within(screen.getByTestId('postRole')).getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(updateModalStatus).toHaveBeenLastCalledWith(true));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(closePopUp).toHaveBeenCalledTimes(1));
    expect(updateModalStatus).toHaveBeenLastCalledWith(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows "Submit" again after a failed Submit', async () => {
    axios.patch.mockRejectedValue(new Error('server error'));
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    fireEvent.click(screen.getByText('Test1 Volunteer'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(await screen.findByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('shows "Submit" again when Submit stops early because no user name is typed', async () => {
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );
    fireEvent.click(screen.getByText('Test1 Volunteer'));
    await flushAllPromises();
    fireEvent.change(screen.getByPlaceholderText('Shows only ACTIVE users'), {
      target: { value: '' },
    });
    const patchCallsBefore = axios.patch.mock.calls.length;
    fireEvent.click(screen.getByText('Submit'));

    expect(toast.error).toHaveBeenCalledWith('Please type the name of a user.');
    expect(axios.patch).toHaveBeenCalledTimes(patchCallsBefore);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
