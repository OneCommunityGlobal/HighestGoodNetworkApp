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
  it('', async () => {
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
  });
});
