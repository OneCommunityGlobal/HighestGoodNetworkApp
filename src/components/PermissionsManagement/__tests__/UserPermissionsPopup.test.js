import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserPermissionsPopUp from '../UserPermissionsPopUp';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { themeMock } from '__tests__/mockStates';
import { ModalContext } from 'context/ModalContext';

const mockStore = configureStore([thunk]);
let store;

const mockModalContext = {
  modalStatus: false,
  updateModalStatus: jest.fn(),
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
});

afterEach(() => {
  store.clearActions();
});

jest.mock('axios');
jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
const flushAllPromises = () => new Promise(setImmediate);

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
    await waitFor(() => {
      expect(screen.getByText('Test1 Volunteer')).toBeInTheDocument();
      expect(screen.getByText('Test2 Manager')).toBeInTheDocument();
      expect(screen.queryByText('Test3 Owner')).not.toBeInTheDocument();
    });
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
    fireEvent.click(nameElement);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Submit'));
    });
    expect(toast.success).toHaveBeenCalledWith(
      `
        Permissions have been updated successfully. 
        Please inform the user to log out and log back in for the new permissions to take effect.`,
      {
        autoClose: 10000,
      },
    );
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
    axios.put.mockRejectedValue({ err: 'server error' });
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
    await waitFor(() => {
      fireEvent.click(screen.getByText('Submit'));
    });
    expect(toast.error).toHaveBeenCalledWith(
      `
        Permission updated failed. ${mockObject}
        `,
      {
        autoClose: 10000,
      },
    );
  });
  it('check if Reset to Default button works as expected', async () => {
    axios.get.mockResolvedValue({
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
    const userElement = screen.getByText('Test2 Manager');
    fireEvent.click(userElement);
    await waitFor(() => {
      const addElement = screen.getAllByText('Add');
      expect(addElement[0]).toBeInTheDocument();
    });
    const profilePermission = screen.getByTestId('putUserProfilePermissions');
    const addButton = profilePermission.querySelector('button');
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(profilePermission.querySelector('Add')).not.toBeInTheDocument();
    });
    const resetToDefaultButton = screen.getByText('Reset to Default');
    fireEvent.click(resetToDefaultButton);
    await waitFor(() => {
      const profilePermissionButtonChange = screen.getByTestId('putUserProfilePermissions');
      expect(profilePermissionButtonChange.querySelector('Delete')).not.toBeInTheDocument();
    });
  });
});
