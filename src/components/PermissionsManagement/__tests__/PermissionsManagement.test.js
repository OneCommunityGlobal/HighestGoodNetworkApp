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
      },
      theme: {
        darkMode: false,
      },
      allUserProfiles: {
        userProfiles: [],
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

  it('toggles user permissions popup when Manage User Permissions button is clicked', async () => {
    await renderComponent();
    const manageButton = screen.getByText('Manage User Permissions');
    await act(async () => {
      fireEvent.click(manageButton);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('fetches change logs on mount', async () => {
    await renderComponent();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`${ENDPOINTS.PERMISSION_CHANGE_LOGS('123')}`),
    );
  });

  it('does not apply dark-mode classes when darkMode is false', async () => {
    const { container } = await renderComponent({ darkMode: false });
    expect(container.firstChild).not.toHaveClass('bg-oxford-blue');
    expect(container.firstChild).not.toHaveClass('text-light');
  });
});
