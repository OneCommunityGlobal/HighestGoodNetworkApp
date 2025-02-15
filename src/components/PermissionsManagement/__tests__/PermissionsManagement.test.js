// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import { ModalContext } from '../../../context/ModalContext';
import PermissionsManagement from '../PermissionsManagement';
import { ENDPOINTS } from '../../../utils/URL';

jest.mock('axios');
const mockStore = configureStore([thunk]);

describe('PermissionsManagement', () => {
  const history = createMemoryHistory();
  let store;

  const mockFunctions = {
    getInfoCollections: jest.fn(),
    getAllRoles: jest.fn(),
    updateUserProfile: jest.fn(),
    getAllUsers: jest.fn(),
    addNewRole: jest.fn(),
    getUserRole: jest.fn(),
    hasPermission: jest.fn(() => true),
  };

  const modalContextValue = {
    modalStatus: false,
    reminderUser: null,
  };

  beforeEach(() => {
    store = mockStore({
      role: {
        roles: [{ roleName: 'Admin' }, { roleName: 'User' }],
      },
      auth: {
        user: { userid: '123' },
        permissions: [],
      },
      userProfile: {
        role: 'Admin',
        loading: false,
      },
      theme: {
        darkMode: true,
      },
      allUserProfiles: {
        userProfiles: [],
      },
      editableInfo: {
        // Add this section
        loading: false,
      },
    });

    jest.clearAllMocks();
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
    await act(async () => {
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
                hasPermission={mockFunctions.hasPermission}
              />
            </ModalContext.Provider>
          </Router>
        </Provider>,
      );
    });
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
    await act(async () => {
      fireEvent.click(adminButton);
    });
    expect(history.location.pathname).toBe('/permissionsmanagement/admin');
  });

  it('opens new role popup when "Add New Role" button is clicked', async () => {
    await renderComponent();
    const addRoleButton = screen.getByText('Add New Role');
    await act(async () => {
      fireEvent.click(addRoleButton);
    });
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
    await act(async () => {
      fireEvent.click(adminButton);
    });

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
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  describe('Permission-based Rendering', () => {
    it('hides role management UI without putRole permission', async () => {
      mockFunctions.hasPermission.mockImplementation(action => action !== 'putRole');
      await renderComponent();
      expect(screen.queryByTestId('role-name-container')).not.toBeInTheDocument();
    });
  });

  describe('Style and Theme Integration', () => {
    it('applies button styles based on dark mode', async () => {
      const { container } = await renderComponent({ darkMode: true });
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        if (button.classList.contains('role-btn')) {
          expect(button).toHaveClass('text-light');
        }
      });
    });
  });
});
