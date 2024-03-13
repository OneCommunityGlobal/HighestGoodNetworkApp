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
    rolePreset: { presets: mockAdminState.role.roles[5].permissions },
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

describe('RolePermissions component', () => {
  it('check if role name is displaying properly', () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    render(
      <Provider store={store}>
        <RolePermissions
          userRole={store.getState().userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={mockAdminState.role.roles[5].permissions}
        />
      </Provider>,
    );
    expect(screen.getByText('Role Name: Owner')).toBeInTheDocument();
  });
  it('check edit role modal', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    const { container } = render(
      <Provider store={store}>
        <RolePermissions
          userRole={store.getState().userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={mockAdminState.role.roles[5].permissions}
        />
      </Provider>,
    );
    const editRoleIcon = container.querySelector('.user-role-tab__icon.edit-icon');
    fireEvent.click(editRoleIcon);
    expect(screen.queryByText('Edit Role Name')).toBeInTheDocument();
    expect(screen.queryByText('New Role Name')).toBeInTheDocument();
    const modalElement = screen.getByRole('dialog');
    const modalDialog = modalElement.querySelector('.modal-dialog');
    const modalContent = modalDialog.querySelector('.modal-content');
    const modalBody = modalContent.querySelector('.modal-body');
    const searchBox = modalBody.querySelector('[name="editRoleName"]');
    fireEvent.change(searchBox, { target: { value: 'manager' } });
    expect(searchBox.value).toBe('manager');
  });
  it('check if permission list header is displaying as expected', () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    render(
      <Provider store={store}>
        <RolePermissions
          userRole={store.getState().userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={mockAdminState.role.roles[5].permissions}
        />
      </Provider>,
    );
    expect(screen.getByText('Permission List')).toBeInTheDocument();
  });
  it('check if presets option do not show when the role is not Owner', () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const store = mockStore({
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
      rolePreset: { presets: mockAdminState.role.roles[3].permissions },
    });

    const roleName = 'Manager';
    const roleId = 'def123';

    render(
      <Provider store={store}>
        <RolePermissions
          userRole={store.getState().userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={mockAdminState.role.roles[5].permissions}
        />
      </Provider>,
    );
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

    render(
      <Provider store={store}>
        <RolePermissions
          userRole={store.getState().userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={mockAdminState.role.roles[5].permissions}
        />
      </Provider>,
    );

    const createNewPresetElement = screen.getByText('Create New Preset');
    fireEvent.click(createNewPresetElement);
    await waitFor(() => {});
    expect(toast.success).toHaveBeenCalledWith('Preset created successfully');
  });
  it('check if clicking on Create New Preset displays toast error message when the post request fails', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    axios.post.mockRejectedValue({
      status: 500,
    });

    render(
      <Provider store={store}>
        <RolePermissions
          userRole={store.getState().userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={mockAdminState.role.roles[5].permissions}
        />
      </Provider>,
    );

    const createNewPresetElement = screen.getByText('Create New Preset');
    fireEvent.click(createNewPresetElement);
    await waitFor(() => {});
    expect(toast.error).toHaveBeenCalledWith('Error creating preset');
  });
  it('check if clicking on Load Presets opens modal', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    render(
      <Provider store={store}>
        <RolePermissions
          userRole={store.getState().userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={mockAdminState.role.roles[5].permissions}
        />
      </Provider>,
    );
    const loadPresetButton = screen.getByText('Load Presets');
    fireEvent.click(loadPresetButton);
    expect(screen.queryByText('Role Presets')).toBeInTheDocument();
  });
  it('check save button toast success message', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <Provider store={store}>
          <RolePermissions
            userRole={store.getState().userProfile.role}
            role={roleName}
            roleId={roleId}
            header={`${roleName} Permissions:`}
            permissions={mockAdminState.role.roles[5].permissions}
          />
        </Provider>
      </Router>,
    );
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    await waitFor(() => {});
    expect(toast.success).toHaveBeenCalledWith('Role updated successfully');
    expect(history.location.pathname).toBe('/permissionsmanagement');
  });
  it('check save button toast success message', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <Provider store={store}>
          <RolePermissions
            userRole={store.getState().userProfile.role}
            role={roleName}
            roleId={roleId}
            header={`${roleName} Permissions:`}
            permissions={mockAdminState.role.roles[5].permissions}
          />
        </Provider>
      </Router>,
    );
  });
  it('check delete role button modal', async () => {
    axios.get.mockResolvedValue({
      data: {},
    });
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <Provider store={store}>
          <RolePermissions
            userRole={store.getState().userProfile.role}
            role={roleName}
            roleId={roleId}
            header={`${roleName} Permissions:`}
            permissions={mockAdminState.role.roles[5].permissions}
          />
        </Provider>
      </Router>,
    );
    const deleteRole = screen.getByText('Delete Role');
    fireEvent.click(deleteRole);
    expect(screen.queryByText(`Delete ${roleName} Role`)).toBeInTheDocument();
    expect(
      screen.queryByText(`Are you sure you want to delete ${roleName} role?`),
    ).toBeInTheDocument();
    const modalElement = screen.getByRole('dialog');
    const modalDialog = modalElement.querySelector('.modal-dialog');
    const modalContent = modalDialog.querySelector('.modal-content');
    const modalHeader = modalContent.querySelector('.modal-header');
    const modalBody = modalContent.querySelector('.modal-body');
  });
});
