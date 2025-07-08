// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { themeMock } from '__tests__/mockStates';
import { ModalContext } from 'context/ModalContext';
import UserPermissionsPopUp from '../UserPermissionsPopUp';

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

describe('UserPermissionsPopup component', async () => {
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
    await waitFor(() => {
      expect(screen.getByText('User name:')).toBeInTheDocument();
    });
  });

  it.skip('check if input box displays only the active users', async () => {
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

    // Espera até o input estar no DOM
    const searchBoxElement = await waitFor(() => {
      return screen.getByPlaceholderText('Shows only ACTIVE users');
    });

    // Faz a mudança no input
    fireEvent.change(searchBoxElement, { target: { value: 'Test' } });

    // Espera os usuários aparecerem
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

    await waitFor(() => {
      expect(screen.getByText('Permissions:')).toBeInTheDocument();
    });
  });

  it('check if submit button works as expected when the button is clicked', async () => {
    axios.get.mockResolvedValue({
      status: 200,
      data: [
        {
          _id: 'def123',
          role: 'Manager',
          firstName: 'Test2',
          lastName: 'Manager',
          email: 'Test2.Manager@gmail.com',
        },
      ],
    });
    axios.put.mockResolvedValue({ status: 200 });

    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Submit'));
    });

    expect(toast.success).toHaveBeenCalledWith(
      `
        Permissions have been updated successfully. 
        Please inform the user to log out and log back in for the new permissions to take effect.`,
      { autoClose: 10000 },
    );
  });

  it.skip('check if toast message gets displayed when the button is not clicked', async () => {
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
  it.skip('check if Reset to Default button works as expected', async () => {
    // Mocka a lista de usuários ativos para o autocomplete
    axios.get.mockImplementation(url => {
      if (url.includes('/api/userProfiles')) {
        return Promise.resolve({
          status: 200,
          data: [
            {
              _id: 'test123',
              role: 'Volunteer',
              firstName: 'TestUser',
              lastName: 'Volunteer',
              isActive: true,
              permissions: {
                frontPermissions: ['Permission 1'],
                removedDefaultPermissions: [],
              },
            },
          ],
        });
      }
      if (url.includes('/api/userProfile/')) {
        return Promise.resolve({
          status: 200,
          data: {
            _id: 'test123',
            role: 'Volunteer',
            firstName: 'TestUser',
            lastName: 'Volunteer',
            email: 'testuser@gmail.com',
            permissions: {
              frontPermissions: ['Permission 1'],
              removedDefaultPermissions: [],
            },
          },
        });
      }
      return Promise.resolve({ status: 200, data: {} });
    });

    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp />
        </ModalContext.Provider>
      </Provider>,
    );

    // Digita algo no input para abrir a lista de usuários
    const searchBoxElement = screen.getByPlaceholderText('Shows only ACTIVE users');
    fireEvent.change(searchBoxElement, { target: { value: 'Test' } });

    // Aguarda o usuário aparecer no autocomplete
    const userElement = await screen.findByText('TestUser Volunteer');
    fireEvent.click(userElement);

    // Agora o botão Reset to Default deve estar habilitado
    const resetButton = await screen.findByRole('button', { name: /reset to default/i });
    expect(resetButton).toBeEnabled();

    // Clica no botão
    fireEvent.click(resetButton);

    // Verifica se as permissões foram resetadas (nesse exemplo, deve não ter mais permissões visíveis)
    await waitFor(() => {
      expect(screen.queryByText('Permission 1')).not.toBeInTheDocument();
    });
  });
});
