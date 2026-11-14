import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import mockAdminState from '__tests__/mockAdminState';
import { ModalContext } from '~/context/ModalContext';
import { permissionLabelKeyMappingObj, permissionLabels } from '../PermissionsConst';
import PermissionChangesList from '../PermissionChangesList';
import listStyles from '../PermissionChangesList.module.css';
import RolePermissions from '../RolePermissions';
import UserPermissionsPopUp from '../UserPermissionsPopUp';

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

const mockStore = configureMockStore([thunk]);

const mockModalContext = {
  modalStatus: false,
  updateModalStatus: vi.fn(),
};

const ownerPermissions = mockAdminState.role.roles.find(role => role.roleName === 'Owner')
  .permissions;

const labelOf = key => permissionLabelKeyMappingObj[key];

const namesOn = testId => screen.getByTestId(testId).textContent.split('; ');

const clickRow = (key, buttonName) =>
  fireEvent.click(within(screen.getByTestId(key)).getByRole('button', { name: buttonName }));

const leafKeys = item => (item.subperms ? item.subperms.flatMap(leafKeys) : [item.key]);

const clickHeading = (name, buttonName) => {
  // eslint-disable-next-line testing-library/no-node-access
  const heading = screen.getByText(new RegExp(`^${name}$`, 'i')).closest('li');
  fireEvent.click(within(heading).getByRole('button', { name: buttonName }));
};

const flushAllPromises = () =>
  new Promise(resolve => {
    setTimeout(resolve, 0);
  });

beforeEach(() => {
  // any GETs on mount should resolve so effects settle
  axios.get.mockResolvedValue({ data: {} });
});

describe('PermissionChangesList', () => {
  it('shows a key that has no on-screen name as it is', () => {
    // A real key: some roles have it
    expect(labelOf('getReporteesLimitRoles')).toBeUndefined();
    render(
      <PermissionChangesList
        saved={[]}
        draft={['getReporteesLimitRoles']}
        emptyText="No permission changes"
      />,
    );
    expect(namesOn('permissions-added')).toEqual(['getReporteesLimitRoles']);
  });
});

describe('unsaved changes list on the role page', () => {
  const roleName = 'Owner';

  const renderRolePage = () => {
    const store = mockStore({
      auth: {
        user: {
          permissions: { frontPermissions: [], backPermissions: [] },
          role: 'Owner',
        },
        permissions: { frontPermissions: [], backPermissions: [] },
      },
      role: mockAdminState.role,
      userProfile: { role: 'Owner' },
      rolePreset: { presets: [] },
      theme: { darkMode: false },
      infoCollections: { infos: [] },
    });
    render(
      <ModalContext.Provider value={mockModalContext}>
        <Router history={createMemoryHistory()}>
          <Provider store={store}>
            <RolePermissions
              role={roleName}
              roleId="abc123"
              permissions={ownerPermissions}
              darkMode={false}
            />
          </Provider>
        </Router>
      </ModalContext.Provider>,
    );
  };

  const renameRole = newName => {
    fireEvent.click(screen.getByTestId('edit-role-icon'));
    fireEvent.change(screen.getByLabelText(/new role name/i), { target: { value: newName } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  };

  it('lists a permission under Permissions Added after Add', () => {
    renderRolePage();
    expect(screen.queryByTestId('permission-changes')).not.toBeInTheDocument();

    clickRow('manageFAQs', 'Add');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/you have unsaved changes/i);
    expect(within(alert).getByText('Permissions Added:')).toBeInTheDocument();
    expect(namesOn('permissions-added')).toEqual([labelOf('manageFAQs')]);
    expect(screen.queryByTestId('permissions-removed')).not.toBeInTheDocument();
    expect(screen.queryByText(/role name changed/i)).not.toBeInTheDocument();
  });

  it('lists a permission under Permissions Removed after Delete', () => {
    renderRolePage();

    clickRow('postRole', 'Delete');

    expect(within(screen.getByRole('alert')).getByText('Permissions Removed:')).toBeInTheDocument();
    expect(namesOn('permissions-removed')).toEqual([labelOf('postRole')]);
    expect(screen.queryByTestId('permissions-added')).not.toBeInTheDocument();
  });

  it('hides the alert again after an undo', () => {
    renderRolePage();

    clickRow('manageFAQs', 'Add');
    expect(screen.getByRole('alert')).toBeInTheDocument();

    clickRow('manageFAQs', 'Delete');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('lists each permission once after a heading Add', () => {
    renderRolePage();

    clickHeading('General', 'Add');

    // seeUsersInDashboard also has a row under Misc/Unsorted; listed once
    expect(namesOn('permissions-added')).toEqual([
      labelOf('seeUsersInDashboard'),
      labelOf('editHeaderMessage'),
    ]);
  });

  it('shows a role name change, with "No permission changes" when only the name changed', () => {
    renderRolePage();

    renameRole('Owner 2');

    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Role name changed from Owner to Owner 2')).toBeInTheDocument();
    expect(within(alert).getByText('No permission changes')).toBeInTheDocument();
  });

  it('never shows an empty role name as a rename', () => {
    renderRolePage();

    renameRole('');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/role name changed/i)).not.toBeInTheDocument();
  });

  it('keeps the alert to one block, and the list quiet for screen readers', () => {
    renderRolePage();

    clickRow('manageFAQs', 'Add');

    const alert = screen.getByRole('alert');
    // eslint-disable-next-line testing-library/no-node-access
    expect(alert.childNodes).toHaveLength(1);
    expect(within(alert).getByTestId('permission-changes')).toHaveAttribute('aria-live', 'off');
  });
});

describe('unsaved changes list in Manage User Permissions', () => {
  // Mock roles: Manager gives putUserProfile by default
  const manager = {
    _id: 'def123',
    isActive: true,
    role: 'Manager',
    firstName: 'Test2',
    lastName: 'Manager',
    email: 'Test2.Manager@gmail.com',
  };

  const openManager = async (saved, popUpProps = {}) => {
    axios.get.mockResolvedValue({ status: 200, data: { ...manager, permissions: saved } });
    const store = mockStore({
      auth: {
        user: {
          permissions: { frontPermissions: ['putUserProfilePermissions'], backPermissions: [] },
          role: 'Owner',
        },
        permissions: { frontPermissions: [], backPermissions: [] },
      },
      role: mockAdminState.role,
      allUserProfiles: { userProfiles: [manager] },
      theme: { darkMode: false },
    });
    render(
      <Provider store={store}>
        <ModalContext.Provider value={mockModalContext}>
          <UserPermissionsPopUp {...popUpProps} />
        </ModalContext.Provider>
      </Provider>,
    );
    fireEvent.click(screen.getByPlaceholderText('Shows only ACTIVE users'));
    fireEvent.click(screen.getByText('Test2 Manager'));
    await flushAllPromises(); // let the saved profile load
  };

  it('shows the list just above Submit, only while something is unsaved', async () => {
    await openManager({ frontPermissions: [], removedDefaultPermissions: [] });
    expect(screen.queryByTestId('permission-changes')).not.toBeInTheDocument();

    clickRow('postRole', 'Add');

    const list = screen.getByTestId('permission-changes');
    expect(namesOn('permissions-added')).toEqual([labelOf('postRole')]);
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('button', { name: 'Submit' }).previousElementSibling).toBe(list);

    clickRow('postRole', 'Delete');
    expect(screen.queryByTestId('permission-changes')).not.toBeInTheDocument();
  });

  it('shows the same list on the Remember to Save card, where a long list scrolls', async () => {
    await openManager(
      { frontPermissions: [], removedDefaultPermissions: [] },
      { modalStatus: true },
    );

    clickRow('postRole', 'Add');

    expect(screen.getByText('Remember to Save Your Changes!')).toBeInTheDocument();
    const [cardList, submitList] = screen.getAllByTestId('permission-changes');
    expect(cardList).toHaveClass(listStyles.permissionChangesListScrollable);
    expect(screen.getByRole('region', { name: 'Unsaved permission changes' })).toBe(cardList);
    expect(submitList).not.toHaveClass(listStyles.permissionChangesListScrollable);
    [cardList, submitList].forEach(list => {
      expect(within(list).getByTestId('permissions-added')).toHaveTextContent(labelOf('postRole'));
    });

    clickRow('postRole', 'Delete');
    expect(screen.queryByText('Remember to Save Your Changes!')).not.toBeInTheDocument();
    expect(screen.queryByTestId('permission-changes')).not.toBeInTheDocument();
  });

  it('marks a role default that is turned off, and drops it when it is turned back on', async () => {
    await openManager({ frontPermissions: [], removedDefaultPermissions: [] });

    clickRow('putUserProfile', 'Delete');
    expect(namesOn('permissions-removed')).toEqual([`${labelOf('putUserProfile')} (role default)`]);

    clickRow('putUserProfile', 'Add');
    expect(screen.queryByTestId('permission-changes')).not.toBeInTheDocument();
  });

  it('leaves role defaults on after a heading Add', async () => {
    await openManager({ frontPermissions: [], removedDefaultPermissions: [] });

    clickHeading('User Management', 'Add');

    expect(screen.queryByTestId('permissions-removed')).not.toBeInTheDocument();
    expect(namesOn('permissions-added')).toContain(labelOf('postUserProfile'));
  });

  it('turns a removed role default back on after a heading Add', async () => {
    await openManager({ frontPermissions: [], removedDefaultPermissions: ['putUserProfile'] });

    clickHeading('User Management', 'Add');

    expect(namesOn('permissions-added')).toContain(labelOf('putUserProfile'));
    expect(screen.queryByTestId('permissions-removed')).not.toBeInTheDocument();
  });

  it('offers Add on a heading while one of its role defaults is turned off', async () => {
    const reportsKeys = leafKeys(permissionLabels.find(item => /^reports$/i.test(item.label)));
    // Saved: every Reports row on, except the role default turned off
    await openManager({
      frontPermissions: reportsKeys.filter(key => key !== 'getWeeklySummaries'),
      removedDefaultPermissions: ['getWeeklySummaries'],
    });

    clickHeading('Reports', 'Add');

    expect(namesOn('permissions-added')).toEqual([labelOf('getWeeklySummaries')]);
    expect(screen.queryByTestId('permissions-removed')).not.toBeInTheDocument();
  });

  it('after Reset to Default, lists extras as removed and returning role defaults as added', async () => {
    // Saved: one extra, one role default turned off
    await openManager({
      frontPermissions: ['postRole'],
      removedDefaultPermissions: ['putUserProfile'],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset to Default' }));

    // Only removed role defaults get "(role default)"
    expect(namesOn('permissions-added')).toEqual([labelOf('putUserProfile')]);
    expect(namesOn('permissions-removed')).toEqual([labelOf('postRole')]);
  });

  it('says so when the lists changed but what the user can do did not', async () => {
    // Both an extra and a role default, so the user keeps it after Delete
    await openManager({ frontPermissions: ['putUserProfile'], removedDefaultPermissions: [] });

    clickRow('putUserProfile', 'Delete');

    expect(screen.getByText('No change to what this user can do')).toBeInTheDocument();
    expect(screen.queryByTestId('permissions-removed')).not.toBeInTheDocument();
  });
});
