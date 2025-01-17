import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import PermissionChangeLogTable from '../PermissionChangeLogTable';
import PermissionsManagement from '../PermissionsManagement';

// Mock all required actions
jest.mock('../../../actions/role', () => ({
  getAllRoles: () => ({ type: 'GET_ALL_ROLES' }),
  addNewRole: role => ({ type: 'ADD_NEW_ROLE', payload: role }),
  fetchAllRoles: data => ({ type: 'FETCH_ALL_ROLES', payload: data }),
}));

jest.mock('../../../actions/userProfile', () => ({
  getUserProfile: id => ({ type: 'GET_USER_PROFILE', payload: id }),
  updateUserProfile: data => ({ type: 'UPDATE_USER_PROFILE', payload: data }),
}));

jest.mock('../../../actions/information', () => ({
  getInfoCollections: () => ({ type: 'GET_INFO_COLLECTIONS' }),
}));

// Mock axios
jest.mock('axios');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

// Mock permissions utility
jest.mock('../../../utils/permissions', () => ({
  __esModule: true,
  default: permission => {
    if (permission === 'postRole') return true;
    if (permission === 'putRole') return true;
    if (permission === 'putUserProfilePermissions') return true;
    return false;
  },
}));

const mockStore = configureMockStore([thunk]);

describe('PermissionsManagement Component', () => {
  let store;

  const initialState = {
    role: {
      roles: [{ roleName: 'Admin' }, { roleName: 'User' }],
    },
    auth: {
      user: {
        userid: '123',
      },
      permissions: ['postRole', 'putRole', 'putUserProfilePermissions'],
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
  };

  beforeEach(() => {
    store = mockStore(initialState);

    // Setup axios mock responses
    axios.get.mockImplementation(url => {
      if (url.includes('permission-change-logs')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: { success: true, data: {} } });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  axios.get.mockResolvedValue({
    data: [{ id: 1, description: 'Permission changed', timestamp: '2024-01-17' }],
  });

  // Test 1: Basic Rendering
  test('renders component with correct title', async () => {
    render(
      <Provider store={store}>
        <PermissionsManagement />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('User Roles')).toBeInTheDocument();
    });
  });

  // Test 2: Role Buttons
  test('renders role buttons for each role', async () => {
    render(
      <Provider store={store}>
        <PermissionsManagement />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  // Test 3: Permission Buttons
  test('shows permission management buttons when user has permissions', async () => {
    render(
      <Provider store={store}>
        <PermissionsManagement />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Add New Role')).toBeInTheDocument();
      expect(screen.getByText('Manage User Permissions')).toBeInTheDocument();
    });
  });

  // Test 4: Dark Mode
  test('applies dark mode styles when darkMode is true', async () => {
    const darkModeStore = mockStore({
      ...initialState,
      theme: { darkMode: true },
    });

    render(
      <Provider store={darkModeStore}>
        <PermissionsManagement />
      </Provider>,
    );

    await waitFor(() => {
      const topLevelDiv = screen.getByText('User Roles').closest('div.permissions-management')
        .parentNode;
      const permissionsManagementDiv = screen
        .getByText('User Roles')
        .closest('div.permissions-management');
      expect(topLevelDiv).toHaveClass('bg-oxford-blue text-light');
      expect(permissionsManagementDiv).toHaveClass('bg-yinmn-blue dark-box-shadow');
    });
  });

  // Test 5: Modal Functionality
  test('toggles New Role modal', async () => {
    render(
      <Provider store={store}>
        <PermissionsManagement />
      </Provider>,
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add New Role'));
    });

    expect(screen.getByText('Create New Role')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByText('Create New Role')).not.toBeInTheDocument();
    });
  });

  // Test 6: Error Handling
  test('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <Provider store={store}>
        <PermissionsManagement />
      </Provider>,
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  // Test 7: Redux Actions
  test('dispatches initial actions', async () => {
    render(
      <Provider store={store}>
        <PermissionsManagement />
      </Provider>,
    );

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual({ type: 'GET_INFO_COLLECTIONS' });
      expect(actions).toContainEqual({
        type: 'GET_USER_PROFILE',
        payload: '123',
      });
    });
  });

  // Test 8: Pagination
  test('displays pagination and initial logs correctly', async () => {
    const mockLogs = Array.from({ length: 45 }, (v, k) => ({
      _id: k + 1,
      logDateTime: new Date().toISOString(),
      roleName: 'User',
      permissions: ['Read', 'Write'],
      permissionsAdded: ['Read'],
      permissionsRemoved: ['Write'],
      requestorRole: 'Admin',
      requestorEmail: 'admin@example.com',
    }));

    render(<PermissionChangeLogTable changeLogs={mockLogs} darkMode={false} />);

    // Initial render should show first 20 items
    expect(screen.getAllByText(/User/).length).toBe(20);

    // Expect pagination controls to be present
    const firstPageButton = screen.getByText('1');
    const lastPageButton = screen.getByText('3'); // Total 45 logs, 20 per page, so 3 pages
    expect(firstPageButton).toBeInTheDocument();
    expect(lastPageButton).toBeInTheDocument();
  });

  // test 9: Navigates to the next Page
  test('navigates to the next page correctly', async () => {
    const mockLogs = Array.from({ length: 45 }, (v, k) => ({
      _id: k + 1,
      logDateTime: new Date().toISOString(),
      roleName: `User ${k + 1}`,
      permissions: ['Read', 'Write'],
      permissionsAdded: ['Read'],
      permissionsRemoved: ['Write'],
      requestorRole: 'Admin',
      requestorEmail: 'admin@example.com',
    }));

    render(<PermissionChangeLogTable changeLogs={mockLogs} darkMode={false} />);

    // Click to second page
    const nextPageButton = screen.getByText('2');
    fireEvent.click(nextPageButton);

    // Check for content that should be visible on the second page
    // Change detection from specific text to more general check if elements are rendered
    await waitFor(() => {
      const visibleLogs = screen.getAllByText(/User /);
      expect(visibleLogs.length).toBeGreaterThanOrEqual(1); // Ensure at least one log is displayed
      expect(visibleLogs.some(node => node.textContent.includes('User 21'))).toBe(true);
    });
  });
});
