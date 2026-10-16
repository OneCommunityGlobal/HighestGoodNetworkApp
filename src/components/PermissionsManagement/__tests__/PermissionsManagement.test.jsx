/* eslint-disable testing-library/no-node-access */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import { ModalContext } from '~/context/ModalContext';
import PermissionsManagement from '../PermissionsManagement';
import { ENDPOINTS } from '~/utils/URL';
import { permissions } from '~/utils/constants';

vi.mock('axios');
const mockStore = configureMockStore([thunk]);

const ownerAuthState = {
  role: {
    roles: [
      {
        roleName: 'Owner',
        permissions: [
          permissions.postRole,
          permissions.putRole,
          permissions.putUserProfilePermissions,
        ],
      },
      { roleName: 'Admin', permissions: [permissions.putRole] },
      { roleName: 'User', permissions: [] },
    ],
  },
  auth: {
    user: {
      userid: '123',
      role: 'Owner',
      permissions: {
        frontPermissions: [
          permissions.postRole,
          permissions.putRole,
          permissions.putUserProfilePermissions,
        ],
        removedDefaultPermissions: [],
      },
    },
    permissions: [],
  },
  userProfile: {
    role: 'Owner',
    loading: false,
  },
  theme: {
    darkMode: true,
  },
  allUserProfiles: {
    userProfiles: [],
  },
  editableInfo: {
    loading: false,
  },
};

describe('PermissionsManagement', () => {
  const history = createMemoryHistory();
  let store;

  const mockFunctions = {
    getInfoCollections: vi.fn(),
    getAllRoles: vi.fn(),
    updateUserProfile: vi.fn(),
    getAllUsers: vi.fn(),
    addNewRole: vi.fn(),
    getUserRole: vi.fn(),
    hasPermission: vi.fn(() => true),
  };

  const modalContextValue = {
    modalStatus: false,
    reminderUser: null,
  };

  beforeEach(() => {
    store = mockStore(ownerAuthState);

    vi.clearAllMocks();
    mockFunctions.hasPermission.mockImplementation(() => true);
    axios.get.mockImplementation(url => {
      if (url.includes('/permission-change-logs')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  const renderComponent = async ({
    roles = store.getState().role.roles,
    auth = store.getState().auth,
    userProfile = store.getState().userProfile,
    darkMode = store.getState().theme.darkMode,
  } = {}) => {
    let rendered;
    rendered = render(
      <Provider store={store}>
        <Router history={history}>
          <ModalContext.Provider value={modalContextValue}>
            <PermissionsManagement
              roles={roles}
              auth={auth}
              userProfile={userProfile}
              darkMode={darkMode}
              getInfoCollections={mockFunctions.getInfoCollections}
              getAllRoles={mockFunctions.getAllRoles}
              updateUserProfile={mockFunctions.updateUserProfile}
              getAllUsers={mockFunctions.getAllUsers}
              addNewRole={mockFunctions.addNewRole}
              getUserRole={mockFunctions.getUserRole}
            />
          </ModalContext.Provider>
        </Router>
      </Provider>,
    );
    return rendered;
  };

  it('fetches change logs on mount', async () => {
    await renderComponent();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`${ENDPOINTS.PERMISSION_CHANGE_LOGS('123')}`),
    );
  });

  it('renders roles correctly', async () => {
    await renderComponent();
    expect(screen.getByText('User Roles')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('navigates to role details page when clicking role button', async () => {
    await renderComponent();
    const adminButton = screen.getByText('Admin');
    fireEvent.click(adminButton);
    expect(history.location.pathname).toBe('/permissionsmanagement/admin');
  });

  it('opens new role popup when "Add New Role" button is clicked', async () => {
    await renderComponent();
    const addRoleButton = screen.getByText('Add New Role');
    await userEvent.click(addRoleButton);

    // Wait for the modal to appear
    await screen.findByRole('dialog');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles null roles gracefully', async () => {
    const rolesWithNull = [{ roleName: 'Admin' }, null, { roleName: 'User' }];

    await renderComponent({ roles: rolesWithNull });
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('navigates to correct role URL on role button click', async () => {
    await renderComponent();

    const adminButton = screen.getByText('Admin');
    fireEvent.click(adminButton);

    expect(history.location.pathname).toBe('/permissionsmanagement/admin');
  });

  it('applies dark-mode styles when darkMode is true', async () => {
    const { container } = await renderComponent({ darkMode: true });
    expect(container.firstChild).toHaveClass('bg-oxford-blue');
    expect(container.firstChild).toHaveClass('text-light');
  });

  it('displays loading message while fetching data', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    await renderComponent();
    expect(screen.getByTestId('loading-message')).toBeInTheDocument();
  });

  describe('Permission-based Rendering', () => {
    it('hides role management UI without putRole permission', async () => {
      store = mockStore({
        ...ownerAuthState,
        auth: {
          ...ownerAuthState.auth,
          user: {
            ...ownerAuthState.auth.user,
            role: 'Volunteer',
            permissions: { frontPermissions: [], removedDefaultPermissions: [] },
          },
        },
        role: {
          roles: [{ roleName: 'Volunteer', permissions: [] }],
        },
      });

      await renderComponent();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      expect(screen.queryByText('User')).not.toBeInTheDocument();
    });
  });

  describe('Style and Theme Integration', () => {
    it('applies button styles based on dark mode', async () => {
      await renderComponent({ darkMode: true });

      // Use screen.getAllByRole instead of container.querySelectorAll
      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        if (button.className.includes('role-btn')) {
          // Check if className contains 'text-light' pattern (CSS modules hash it)
          expect(button.className).toMatch(/text-light/);
        }
      });
    });
  });
});
