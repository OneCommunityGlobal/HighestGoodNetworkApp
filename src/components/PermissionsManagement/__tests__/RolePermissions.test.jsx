/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import mockAdminState from '__tests__/mockAdminState';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { ModalContext } from '~/context/ModalContext';
import { ENDPOINTS } from '~/utils/URL';
import { permissions as permissionKeys } from '~/utils/constants';
import RolePermissions from '../RolePermissions';
import { toast } from 'react-toastify';

// ---- Local, file-scoped mocks ----
vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value }) => <textarea aria-label="Mock Editor" value={value} readOnly />,
}));

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

const mockStore = configureMockStore([thunk]);
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
    infoCollections: { infos: [] },
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

const renderComponent = (newStore, history, newRoleName, newRoleId, darkMode = false) =>
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
            darkMode={darkMode}
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

    const editIcon = await screen.findByTestId('edit-role-icon');
    fireEvent.click(editIcon);

    const dialog = screen.getByRole('dialog');

    const matchingTitles = within(dialog).getAllByText(
      (_, el) => el.textContent?.trim() === 'Edit Role Name',
    );
    expect(matchingTitles.length).toBeGreaterThan(0);

    const input = within(dialog).getByLabelText(/new role name/i);
    fireEvent.change(input, { target: { value: 'Manager' } });
    expect(input).toHaveValue('Manager');
  }, 10000);

  it('opens and closes the permission headings without an unsaved changes alert', () => {
    mockModalContext.updateModalStatus.mockClear();
    renderComponent(store, createMemoryHistory(), roleName, roleId);

    // case-insensitive, so the test still passes if the headings are written in capitals
    fireEvent.click(screen.getByRole('button', { name: /^reports$/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
    // the third level was closed too: Project Management > Work Breakdown Structures > Tasks
    fireEvent.click(screen.getByRole('button', { name: /^project management$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^work breakdown structures$/i }));
    const tasks = screen.getByRole('button', { name: /^tasks$/i });
    expect(tasks).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Open all' }));
    expect(screen.queryAllByRole('button', { expanded: false })).toHaveLength(0);

    expect(screen.queryByText(/you have unsaved changes/i)).not.toBeInTheDocument();
    expect(mockModalContext.updateModalStatus).not.toHaveBeenCalled();
  }, 10000);

  describe('blue info icons next to Save and Delete Role', () => {
    const ICON_TITLE = 'Click for information about this';

    // the permission rows below have the same icon, so look next to the button only
    const openInfoNextTo = buttonName => {
      // eslint-disable-next-line testing-library/no-node-access
      const buttonGroup = screen.getByText(buttonName).parentElement;
      fireEvent.click(within(buttonGroup).getByTitle(ICON_TITLE));
      return screen.getByRole('dialog');
    };

    // the signed-in person has their own right to edit roles, whatever their role is
    const storeFor = (signedInRole, extraState = {}) =>
      mockStore({
        auth: {
          user: {
            permissions: {
              frontPermissions: [permissionKeys.putRole, permissionKeys.addDeleteEditOwners],
              backPermissions: [],
            },
            role: signedInRole,
          },
          permissions: { frontPermissions: [], backPermissions: [] },
        },
        role: mockAdminState.role,
        userProfile: { role: signedInRole },
        rolePreset: { presets: [] },
        theme: { darkMode: false },
        ...extraState,
      });

    it('opens the Save and Presets box with its list and bold, and no Role Info pop-up', () => {
      renderComponent(store, createMemoryHistory(), roleName, roleId);

      const box = openInfoNextTo('Save');

      expect(
        within(box).getByText('Welcome to the Save and Presets Information Page!'),
      ).toBeInTheDocument();
      expect(within(box).getAllByRole('listitem')).toHaveLength(2);
      expect(within(box).getByText('Create New Preset:').tagName).toBe('STRONG');
      expect(screen.queryByText('Role Info')).not.toBeInTheDocument();
    }, 10000);

    it('opens the Load Presets and Delete Role box with its list and bold warning', () => {
      renderComponent(store, createMemoryHistory(), roleName, roleId);

      const box = openInfoNextTo('Delete Role');

      expect(
        within(box).getByText('Welcome to the Load Presets and Delete Role Information Page!'),
      ).toBeInTheDocument();
      expect(within(box).getAllByRole('listitem')).toHaveLength(2);
      expect(within(box).getByText('WARNING: This action cannot be undone.').tagName).toBe(
        'STRONG',
      );
    }, 10000);

    it("lets an Owner edit and save the box on another role's page", async () => {
      axios.post.mockResolvedValue({ status: 201 });
      const ownerStore = storeFor('Owner', { userProfile: { role: 'Volunteer' } });
      renderComponent(ownerStore, createMemoryHistory(), 'Manager', roleId);

      const box = openInfoNextTo('Save');
      fireEvent.click(within(box).getByText(/^Here you can create new presets/));
      fireEvent.click(within(box).getByText('Save'));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          ENDPOINTS.INFO_COLLECTIONS,
          expect.objectContaining({ infoName: 'Permission Page: save Info' }),
        );
      });
    }, 10000);

    it('lets an Administrator on the Owner page read the box but not edit it', () => {
      const adminStore = storeFor('Administrator', { userProfile: { role: 'Owner' } });
      renderComponent(adminStore, createMemoryHistory(), 'Owner', roleId);

      const box = openInfoNextTo('Delete Role');
      fireEvent.click(within(box).getByText(/^Here you can load saved presets/));

      expect(within(box).getByText(/^Here you can load saved presets/)).toBeInTheDocument();
      expect(within(box).queryByLabelText('Mock Editor')).not.toBeInTheDocument();
      expect(within(box).queryByText('Save')).not.toBeInTheDocument();
    }, 10000);

    it('shows the saved text instead of the starting text', () => {
      const savedText = {
        infoName: 'Permission Page: delete role Info',
        infoContent: '<p>Saved by an Owner</p>',
        visibility: '0',
      };
      const storeWithText = storeFor('Owner', { infoCollections: { infos: [savedText] } });
      renderComponent(storeWithText, createMemoryHistory(), 'Manager', roleId);

      const box = openInfoNextTo('Delete Role');

      expect(within(box).getByText('Saved by an Owner')).toBeInTheDocument();
      expect(within(box).queryByText(/^Here you can load saved presets/)).not.toBeInTheDocument();
    }, 10000);

    it('passes dark mode to both boxes', () => {
      renderComponent(store, createMemoryHistory(), roleName, roleId, true);

      ['Save', 'Delete Role'].forEach(name => {
        const box = openInfoNextTo(name);
        // eslint-disable-next-line testing-library/no-node-access
        expect(box.querySelector('.modal-body')).toHaveClass('text-light');
        fireEvent.click(within(box).getByText('Close'));
      });
    }, 10000);

    it('asks the server for the info texts once, for the icons and all the rows together', () => {
      axios.get.mockClear();
      renderComponent(store, createMemoryHistory(), roleName, roleId);

      const infoRequests = axios.get.mock.calls.filter(
        ([url]) => url === ENDPOINTS.INFO_COLLECTIONS,
      );
      expect(infoRequests).toHaveLength(1);
    }, 10000);
  });
});
