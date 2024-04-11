import React from 'react';
import { render, screen, fireEvent, waitFor, act, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RolePermissions from '../RolePermissions';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

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
  });
});

afterEach(() => {
  store.clearActions();
});

const roleName = 'Owner';
const roleId = 'abc123';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  ...jest.requireActual('react-toastify'),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const flushAllPromises = () => new Promise(setImmediate);

const renderComponent = (newStore, history, newRoleName, newRoleId) => {
  return render(
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
    </Router>,
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
    expect(screen.queryByText('Role Presets')).toBeInTheDocument();
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
      expect(history.location.pathname).toBe('/permissionsmanagement');
    });
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
  it('check if delete role modal content displays as expected', () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const history = createMemoryHistory();
    renderComponent(store, history, roleName, roleId);
    const deleteRole = screen.getByText('Delete Role');
    fireEvent.click(deleteRole);

    const modalElement = screen.getByRole('dialog');
    const modalDialog = modalElement.querySelector('.modal-dialog');
    const modalContent = modalDialog.querySelector('.modal-content');
    const modalBody = modalContent.querySelector('.modal-body');

    expect(screen.getByText(`Delete ${roleName} Role`)).toBeInTheDocument();
    expect(modalBody.textContent).toBe('Are you sure you want to delete Owner role?');
  });
  it('check if edit role modal content displays as expected', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    const history = createMemoryHistory();
    const { container } = renderComponent(store, history, roleName, roleId);

    const editRoleIcon = container.querySelector('.user-role-tab__icon.edit-icon');
    expect(screen.queryByText('Edit Role Name')).not.toBeInTheDocument();
    fireEvent.click(editRoleIcon);

    const modalElement = screen.getByRole('dialog');
    const modalDialog = modalElement.querySelector('.modal-dialog');
    const modalContent = modalDialog.querySelector('.modal-content');
    const modalBody = modalContent.querySelector('.modal-body');

    expect(screen.queryByText('New Role Name')).toBeInTheDocument();
    const searchBox = modalBody.querySelector('[name="editRoleName"]');
    fireEvent.change(searchBox, { target: { value: 'manager' } });
    expect(searchBox.value).toBe('manager');
  });
});
