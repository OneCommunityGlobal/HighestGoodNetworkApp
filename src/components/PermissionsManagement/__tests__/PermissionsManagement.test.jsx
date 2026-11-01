/* eslint-disable testing-library/no-node-access */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import { ModalContext, ModalProvider } from '~/context/ModalContext';
import PermissionsManagement from '../PermissionsManagement';
import { ENDPOINTS } from '~/utils/URL';
import { permissions } from '~/utils/constants';
import appStyles from '~/App.module.css';

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
    expect(container.firstChild).toHaveClass(appStyles['bg-oxford-blue']);
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

  describe('Manage User Permissions pop-up', () => {
    const REMINDER = 'Remember to Save Your Changes!';

    // The real ModalProvider, as in App.jsx, so the shared "unsaved changes" flag
    // behaves as it does in the browser.
    const renderWithModalProvider = () =>
      render(
        <Provider store={store}>
          <Router history={history}>
            <ModalProvider>
              <PermissionsManagement />
            </ModalProvider>
          </Router>
        </Provider>,
      );

    const renderWithModalContext = contextValue =>
      render(
        <Provider store={store}>
          <Router history={history}>
            <ModalContext.Provider value={contextValue}>
              <PermissionsManagement />
            </ModalContext.Provider>
          </Router>
        </Provider>,
      );

    // One active user in the store; their saved profile loads when they are picked.
    const renderWithUser = (user, extraRoles = []) => {
      store = mockStore({
        ...ownerAuthState,
        role: { roles: [...ownerAuthState.role.roles, ...extraRoles] },
        allUserProfiles: { userProfiles: [user] },
      });
      axios.get.mockImplementation(url => {
        if (url.includes('/permission-change-logs')) return Promise.resolve({ data: [] });
        if (url === ENDPOINTS.USER_PROFILE(user._id)) return Promise.resolve({ data: user });
        return Promise.resolve({ data: {} });
      });
      renderWithModalProvider();
    };

    const makeUser = (_id, role, lastName) => ({
      _id,
      isActive: true,
      role,
      firstName: 'Test',
      lastName,
      email: `test.${lastName.toLowerCase()}@example.com`,
      permissions: { frontPermissions: [], removedDefaultPermissions: [] },
    });

    const openUserPermissions = async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Manage User Permissions' }));
      return screen.findByRole('heading', { name: 'Manage User Permissions' });
    };

    // Lets pending requests and effects finish. The app (createRoot) runs a click's effects right
    // away; this test renderer does not, so a test waits before its next click.
    const settle = () =>
      act(
        () =>
          new Promise(resolve => {
            setTimeout(resolve, 0);
          }),
      );

    const pickUser = async user => {
      await openUserPermissions();
      await userEvent.click(screen.getByText(`${user.firstName} ${user.lastName}`));
      await settle(); // let the user's saved profile load
    };

    const postRoleButton = name =>
      within(screen.getByTestId('postRole')).getByRole('button', { name });

    // The X in the pop-up's header (the reminder box has its own 'Close' button).
    const clickDialogClose = () =>
      userEvent.click(
        within(
          screen.getByRole('heading', { name: 'Manage User Permissions' }).parentElement,
        ).getByRole('button', { name: 'Close' }),
      );

    // reactstrap removes the 'show' class as soon as a modal starts to close, so this checks
    // "still open" right away instead of waiting out the 300 ms close animation.
    const expectStillOpen = () => expect(screen.getByRole('dialog')).toHaveClass('show');

    it('opens after a permission was added in the New Role pop-up, without a page refresh', async () => {
      axios.post.mockResolvedValue({ status: 201, data: {} });
      renderWithModalProvider();

      // Add New Role -> add one permission -> Create
      await userEvent.click(screen.getByRole('button', { name: 'Add New Role' }));
      const newRoleDialog = await screen.findByRole('dialog');
      await userEvent.type(
        within(newRoleDialog).getByPlaceholderText('Please enter a new role name'),
        'Test Role',
      );
      await userEvent.click(within(newRoleDialog).getAllByRole('button', { name: 'Add' })[0]);
      await userEvent.click(within(newRoleDialog).getByRole('button', { name: 'Create' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      expect(await openUserPermissions()).toBeInTheDocument();
    });

    it('opens even if another screen left the flag on, and the flag gets cleared', async () => {
      const updateModalStatus = vi.fn();
      renderWithModalContext({ modalStatus: true, updateModalStatus });

      expect(await openUserPermissions()).toBeInTheDocument();
      expect(updateModalStatus).toHaveBeenCalledWith(false);
    });

    it('closes on X when there are no unsaved changes', async () => {
      renderWithModalProvider();
      await openUserPermissions();

      await clickDialogClose();

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('stays open on X and Esc while there are unsaved changes, until the reminder is closed', async () => {
      const user = makeUser('u1', 'Volunteer', 'Volunteer');
      renderWithUser(user);
      await pickUser(user);

      await userEvent.click(postRoleButton('Add'));
      expect(await screen.findByText(REMINDER)).toBeInTheDocument();
      await waitFor(expectStillOpen); // opening animation finished

      await clickDialogClose();
      expectStillOpen();
      fireEvent.keyUp(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
      expectStillOpen();
      expect(screen.getByText(REMINDER)).toBeInTheDocument();

      // The reminder's own 'Close' turns the flag off, so X closes again (as before this fix)
      const reminderBox = screen.getByText(REMINDER).closest('div').parentElement;
      await userEvent.click(within(reminderBox).getByRole('button', { name: 'Close' }));
      await clickDialogClose();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('closes on X again once an added permission is removed (nothing left to save)', async () => {
      const user = makeUser('u1', 'Volunteer', 'Volunteer');
      renderWithUser(user);
      await pickUser(user);

      await userEvent.click(postRoleButton('Add'));
      expect(await screen.findByText(REMINDER)).toBeInTheDocument();

      await userEvent.click(postRoleButton('Delete'));
      await waitFor(() => expect(screen.queryByText(REMINDER)).not.toBeInTheDocument());

      await clickDialogClose();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('closes on X after a category Delete that changed nothing (the role gives those permissions)', async () => {
      // 'Popup Management' only holds updatePopup, which this user's role already gives, so the
      // category shows 'Delete' but there is nothing in the user's own lists to remove.
      const user = makeUser('u2', 'Administrator', 'Admin');
      renderWithUser(user, [{ roleName: 'Administrator', permissions: [permissions.updatePopup] }]);
      await pickUser(user);

      const popupCategory = screen.getByText(/^popup management$/i).closest('li');
      await userEvent.click(await within(popupCategory).findByRole('button', { name: 'Delete' }));
      await settle();
      expect(screen.queryByText(REMINDER)).not.toBeInTheDocument();

      await clickDialogClose();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });
});
