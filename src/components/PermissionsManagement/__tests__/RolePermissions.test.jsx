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
import { configureStore } from 'redux-mock-store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { ModalContext } from '~/context/ModalContext';
import RolePermissions from '../RolePermissions';

const mockModalContext = {
  modalStatus: false,
  updateModalStatus: vi.fn(),
};

const mockStore = configureStore([thunk]);
let store;

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
});

afterEach(() => {
  store.clearActions();
});

const roleName = 'Owner';
const roleId = 'abc123';

vi.mock('axios');

// eslint-disable-next-line no-unused-vars
const flushAllPromises = () => new Promise(setImmediate);

const renderComponent = (newStore, history, newRoleName, newRoleId) => {
  return render(
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
};

describe('RolePermissions component', () => {
  it('check if role name is displaying properly', () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    expect(screen.getByText('Role Name: Owner')).toBeInTheDocument();
  });
  it('check if permission list header is displaying as expected', () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    expect(screen.getByText('Permission List')).toBeInTheDocument();
  });
  it('check if presets option do not show when the role is not Owner', () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const newStore = mockStore({
      auth: {
        user: {
          permissions: {
            frontPermissions: [],
            backPermissions: [],
          },
          role: 'Manager',
        },
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
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
  });
  it('check if clicking on Create New Preset displays toast success message when the post request is successful', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    axios.post.mockResolvedValue({
      status: 201,
      data: { newPreset: 'New Preset 1' },
    });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    const createNewPresetElement = screen.getByText('Create New Preset');
    fireEvent.click(createNewPresetElement);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Preset created successfully');
    });
  });
  it('check if clicking on Create New Preset displays toast error message when the post request fails', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    axios.post.mockRejectedValue({
      status: 500,
    });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    const createNewPresetElement = screen.getByText('Create New Preset');
    fireEvent.click(createNewPresetElement);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error creating preset');
    });
  });
  it('check if clicking on Load Presets opens modal', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    const loadPresetButton = screen.getByText('Load Presets');
    fireEvent.click(loadPresetButton);
    expect(screen.getByText('Role Presets')).toBeInTheDocument();
  });
  it('check save button toast success message', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Role updated successfully');
    });
    expect(history.location.pathname).toBe('/permissionsmanagement');
  });

  it('check delete role button works as expected', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    const deleteRole = screen.getByText('Delete Role');
    fireEvent.click(deleteRole);
    expect(screen.getByText(`Delete ${roleName} Role`)).toBeInTheDocument();
  });
  it('check if delete role modal content displays as expected', async () => {
    axios.get.mockResolvedValue({ data: {} });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    const deleteRole = screen.getByText('Delete Role');
    fireEvent.click(deleteRole);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');

      const matchingHeaders = within(dialog).getAllByText(
        (_, el) => el.textContent?.replace(/\s+/g, ' ').trim() === `Delete ${roleName} Role`,
      );
      expect(matchingHeaders.length).toBeGreaterThan(0);

      const matchingConfirm = within(dialog).getAllByText(
        (_, el) =>
          el.textContent?.replace(/\s+/g, ' ').trim() ===
          `Are you sure you want to delete ${roleName} role?`,
      );
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(matchingConfirm.length).toBeGreaterThan(0);
    });
  });
  it('check if edit role modal content displays as expected', async () => {
    axios.get.mockResolvedValue({ data: {} });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);

    const editRoleIcon = screen.getByTestId('edit-role-icon');
    fireEvent.click(editRoleIcon);

    const dialog = screen.getByRole('dialog');

    const matchingTitles = within(dialog).getAllByText(
      (_, el) => el.textContent?.trim() === 'Edit Role Name',
    );
    expect(matchingTitles.length).toBeGreaterThan(0);

    const input = within(dialog).getByLabelText(/new role name/i);
    fireEvent.change(input, { target: { value: 'Manager' } });
    expect(input).toHaveValue('Manager');
  });
});
