/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { ModalContext } from '~/context/ModalContext';
import RolePermissions from '../RolePermissions';
import { toast } from 'react-toastify';

// ---- Local, file-scoped mocks ----
vi.mock('axios', () => {
  const mock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(),
  };
  mock.create.mockReturnValue(mock);
  return { default: mock };
});

vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  ToastContainer: () => null,
}));

const mockModalContext = {
  modalStatus: false,
  updateModalStatus: vi.fn(),
};

const mockStore = configureStore([thunk]);
let store;

// toast spies so .toHaveBeenCalled* works reliably
let toastSuccessSpy;
let toastErrorSpy;

beforeEach(() => {
  store = mockStore({
    auth: {
      user: {
        permissions: { frontPermissions: [], backPermissions: [] },
        role: 'Owner',
      },
      permissions: { frontPermissions: [], backPermissions: [] },
    },
    role: mockAdminState.role,
    userProfile: { role: 'Owner' },
    rolePreset: {
      presets: [
        {
          _id: 'preset123',
          permissions: mockAdminState.role.roles[5].permissions,
          roleName: 'Owner',
          presetName: 'Preset name 1',
        },
      ],
    },
    theme: { darkMode: false },
  });

  // any GETs on mount should resolve so effects settle
  axios.get.mockResolvedValue({ data: {} });

  // setup spies
  toastSuccessSpy = vi.spyOn(toast, 'success');
  toastErrorSpy = vi.spyOn(toast, 'error');
});

afterEach(() => {
  store.clearActions();
  toastSuccessSpy.mockRestore();
  toastErrorSpy.mockRestore();
});

const roleName = 'Owner';
const roleId = 'abc123';

const renderComponent = (newStore, history, newRoleName, newRoleId) =>
  render(
    <ModalContext.Provider value={mockModalContext}>
      <Router history={history}>
        <Provider store={newStore}>
          <RolePermissions
            userRole={newStore.getState().userProfile.role}
            role={newRoleName}
            roleId={newRoleId}
            header={`${newRoleName} Permissions:`}
            permissions={mockAdminState.role.roles[5].permissions}
          />
        </Provider>
      </Router>
    </ModalContext.Provider>,
  );

describe('RolePermissions component', () => {
  it('check if role name is displaying properly', async () => {
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    expect(await screen.findByText('Role Name: Owner')).toBeInTheDocument();
  }, 10000);

  it('check if permission list header is displaying as expected', async () => {
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    expect(await screen.findByText('Permission List')).toBeInTheDocument();
  }, 10000);

  it('check if presets option do not show when the role is not Owner', async () => {
    const newStore = mockStore({
      auth: {
        user: {
          permissions: { frontPermissions: [], backPermissions: [] },
          role: 'Manager',
        },
        permissions: { frontPermissions: [], backPermissions: [] },
      },
      role: mockAdminState.role,
      userProfile: { role: 'Manager' },
      rolePreset: {
        presets: [
          {
            _id: 'preset456',
            permissions: mockAdminState.role.roles[3].permissions,
            roleName: 'Manager',
            presetName: 'Preset name 2',
          },
        ],
      },
      theme: { darkMode: false },
    });

    const newRoleName = 'Manager';
    const newRoleId = 'def123';
    const history = createMemoryHistory();
    renderComponent(newStore, history, newRoleName, newRoleId);
    expect(screen.queryByText('Create New Preset')).not.toBeInTheDocument();
  }, 10000);

  it('check if clicking on Create New Preset displays toast success message when the post request is successful', async () => {
    axios.post.mockResolvedValue({ status: 201, data: { newPreset: 'New Preset 1' } });
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    fireEvent.click(screen.getByText('Create New Preset'));

    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith('Preset created successfully');
    });
  }, 10000);

  it('check if clicking on Create New Preset displays toast error message when the post request fails', async () => {
    axios.post.mockRejectedValue({ status: 500 });
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    fireEvent.click(screen.getByText('Create New Preset'));

    await waitFor(() => {
      expect(toastErrorSpy).toHaveBeenCalledWith('Error creating preset');
    });
  }, 10000);

  it('check if clicking on Load Presets opens modal', async () => {
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    fireEvent.click(screen.getByText('Load Presets'));
    expect(screen.getByText('Role Presets')).toBeInTheDocument();
  }, 10000);

  it('check save button toast success message', async () => {
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(toastSuccessSpy).toHaveBeenCalledWith('Role updated successfully');
    });
    expect(history.location.pathname).toBe('/permissionsmanagement');
  }, 10000);

  it('check delete role button works as expected', async () => {
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    fireEvent.click(screen.getByText('Delete Role'));
    expect(screen.getByText(`Delete ${roleName} Role`)).toBeInTheDocument();
  }, 10000);

  it('check if edit role modal content displays as expected', async () => {
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    fireEvent.click(screen.getByTestId('edit-role-icon'));

    const dialog = screen.getByRole('dialog');

    const matchingTitles = within(dialog).getAllByText(
      (_, el) => el.textContent?.trim() === 'Edit Role Name',
    );
    expect(matchingTitles.length).toBeGreaterThan(0);

    const input = within(dialog).getByLabelText(/new role name/i);
    fireEvent.change(input, { target: { value: 'Manager' } });
    expect(input).toHaveValue('Manager');
  }, 10000);
});
