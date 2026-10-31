import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import LBUserManagement from '../LBUserManagement';
import {
  lbUserManagementReducer,
  initialState,
} from '../../../../reducers/listBidDashboard/userManagementReducer';
import {
  getBearerToken,
  getAuthHeaders,
  parseApiError,
  normalizeUsersResponse,
  setLBUsersPage,
  setLBUsersLimit,
  setLBUsersSearch,
  clearLBUsersError,
} from '../../../../actions/lbDashboard/userManagementActions';
import {
  FETCH_LB_USERS_REQUEST,
  FETCH_LB_USERS_SUCCESS,
  FETCH_LB_USERS_FAILURE,
  UPDATE_LB_USER_REQUEST,
  UPDATE_LB_USER_SUCCESS,
  UPDATE_LB_USER_FAILURE,
  DELETE_LB_USER_REQUEST,
  DELETE_LB_USER_SUCCESS,
  DELETE_LB_USER_FAILURE,
} from '../../../../constants/lbDashboard/userManagementConstants';
import { themeReducer } from '../../../../reducers/themeReducer';
import { authReducer } from '../../../../reducers/authReducer';

vi.mock('axios');

const mockUsers = [
  {
    _id: 'user-1',
    firstName: 'Alice',
    lastName: 'Anderson',
    email: 'alice@example.com',
    phone: '555-0101',
    createdAt: '2026-01-15T10:30:00.000Z',
  },
  {
    _id: 'user-2',
    firstName: 'Bob',
    lastName: 'Builder',
    email: 'bob@example.com',
    phone: '555-0202',
    createdAt: '2026-02-20T14:00:00.000Z',
  },
];

const createTestStore = (preloadedState = {}) => {
  const rootReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
    lbUserManagement: lbUserManagementReducer,
  });

  return createStore(
    rootReducer,
    {
      auth: {
        isAuthenticated: true,
        user: { role: 'Administrator', access: { canAccessLBPortal: true } },
      },
      theme: { darkMode: false },
      ...preloadedState,
    },
    applyMiddleware(thunk),
  );
};

const renderWithProviders = (
  ui,
  { store = createTestStore(), history = createMemoryHistory() } = {},
) => {
  return {
    store,
    history,
    ...render(
      <Provider store={store}>
        <Router history={history}>{ui}</Router>
      </Provider>,
    ),
  };
};

describe('LBUserManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'admin-jwt-token-123');
  });

  it('fetches and displays users with required table columns and attaches Bearer token', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        users: mockUsers,
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });

    renderWithProviders(<LBUserManagement />);

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Anderson')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('555-0101')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    const [calledUrl, calledConfig] = axios.get.mock.calls[0];
    expect(calledUrl).toContain('/lbdashboard/admin/users?page=1&limit=10');
    expect(calledConfig.headers.Authorization).toBe('Bearer admin-jwt-token-123');
  });

  it('supports search filtering, form submission, and clearing search', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { users: mockUsers, page: 1, limit: 10, total: 2, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        data: { users: [mockUsers[0]], page: 1, limit: 10, total: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        data: { users: [mockUsers[0]], page: 1, limit: 10, total: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        data: { users: mockUsers, page: 1, limit: 10, total: 2, totalPages: 1 },
      });

    renderWithProviders(<LBUserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by name or email/i);
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    const [searchUrl] = axios.get.mock.calls[1];
    expect(searchUrl).toContain('/lbdashboard/admin/users?page=1&limit=10&search=alice');

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    // Submit search form explicitly
    const searchBtn = screen.getByRole('button', { name: /^search$/i });
    fireEvent.click(searchBtn);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });

    // Clear search
    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearBtn);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('supports pagination controls for page navigation and limit changes', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { users: mockUsers, page: 1, limit: 10, total: 25, totalPages: 3 },
      })
      .mockResolvedValueOnce({
        data: {
          users: [
            {
              _id: 'user-3',
              firstName: 'Charlie',
              lastName: 'Clark',
              email: 'charlie@example.com',
              phone: '555-0303',
              createdAt: '2026-03-10T09:00:00.000Z',
            },
          ],
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      })
      .mockResolvedValueOnce({
        data: { users: mockUsers, page: 1, limit: 20, total: 25, totalPages: 2 },
      });

    renderWithProviders(<LBUserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });
    expect(axios.get.mock.calls[1][0]).toContain('/lbdashboard/admin/users?page=2&limit=10');

    const limitSelect = screen.getByLabelText(/rows per page/i);
    fireEvent.change(limitSelect, { target: { value: '20' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
    expect(axios.get.mock.calls[2][0]).toContain('/lbdashboard/admin/users?page=1&limit=20');
  });

  it('validates edit form and edits user details via PATCH /lbdashboard/admin/users/:id', async () => {
    axios.get.mockResolvedValueOnce({
      data: { users: mockUsers, page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    axios.patch.mockResolvedValueOnce({
      data: {
        user: {
          ...mockUsers[0],
          firstName: 'Alicia',
          phone: '555-9999',
        },
      },
    });

    renderWithProviders(<LBUserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    const row = screen.getByTestId('user-row-user-1');
    const editBtn = within(row).getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);

    const firstNameInput = await screen.findByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    expect(firstNameInput).toHaveValue('Alice');

    // Trigger validation errors
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: '' } });
    fireEvent.change(lastNameInput, { target: { name: 'lastName', value: '' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'bad-email' } });
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    expect(await screen.findByText('First name is required.')).toBeInTheDocument();
    expect(screen.getByText('Last name is required.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(axios.patch).not.toHaveBeenCalled();

    // Fix inputs and submit
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Alicia' } });
    fireEvent.change(lastNameInput, { target: { name: 'lastName', value: 'Anderson' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'alice@example.com' } });
    const phoneInput = screen.getByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { name: 'phone', value: '555-9999' } });

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledTimes(1);
    });

    const [patchUrl, patchPayload, patchConfig] = axios.patch.mock.calls[0];
    expect(patchUrl).toContain('/lbdashboard/admin/users/user-1');
    expect(patchPayload).toEqual({
      firstName: 'Alicia',
      lastName: 'Anderson',
      email: 'alice@example.com',
      phone: '555-9999',
    });
    expect(patchConfig.headers.Authorization).toBe('Bearer admin-jwt-token-123');

    await waitFor(() => {
      expect(screen.getByText('Alicia')).toBeInTheDocument();
      expect(screen.getByText('555-9999')).toBeInTheDocument();
    });
  });

  it('confirms and deletes a user via DELETE /lbdashboard/admin/users/:id', async () => {
    axios.get.mockResolvedValueOnce({
      data: { users: mockUsers, page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    axios.delete.mockResolvedValueOnce({
      data: { message: 'User deleted successfully' },
    });

    renderWithProviders(<LBUserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    const row = screen.getByTestId('user-row-user-2');
    const deleteBtn = within(row).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(await screen.findByText(/confirm delete user/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledTimes(1);
    });

    const [deleteUrl, deleteConfig] = axios.delete.mock.calls[0];
    expect(deleteUrl).toContain('/lbdashboard/admin/users/user-2');
    expect(deleteConfig.headers.Authorization).toBe('Bearer admin-jwt-token-123');

    await waitFor(() => {
      expect(screen.queryByText('bob@example.com')).not.toBeInTheDocument();
    });
  });

  it('handles 401 Unauthorized error state by showing warning and redirecting to login', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Invalid or expired token' },
      },
    });

    const history = createMemoryHistory({ initialEntries: ['/lbdashboard/admin/users'] });
    renderWithProviders(<LBUserManagement />, { history });

    await waitFor(() => {
      expect(screen.getByText(/401 Unauthorized/i)).toBeInTheDocument();
    });
    expect(history.location.pathname).toBe('/lbdashboard/login');
  });

  it('handles 403 Forbidden error state by displaying access-denied warning', async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: 'Admin privileges required' },
      },
    });

    const history = createMemoryHistory({ initialEntries: ['/lbdashboard/admin/users'] });
    renderWithProviders(<LBUserManagement />, { history });

    await waitFor(() => {
      expect(screen.getByText(/403 Forbidden/i)).toBeInTheDocument();
      expect(screen.getByText(/Admin privileges required/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /return to dashboard/i }));
    expect(history.location.pathname).toBe('/lbdashboard');
  });

  it('handles generic server error and retry button in dark mode', async () => {
    axios.get
      .mockRejectedValueOnce({
        response: { status: 500, data: 'Internal Server Error' },
      })
      .mockResolvedValueOnce({
        data: mockUsers,
      });

    const store = createTestStore({ theme: { darkMode: true } });
    renderWithProviders(<LBUserManagement />, { store });

    await waitFor(() => {
      expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});

describe('LBUserManagement Actions & Reducer Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('formats Bearer tokens and auth headers properly', () => {
    expect(getBearerToken()).toBe('');
    expect(getAuthHeaders()).toEqual({});

    localStorage.setItem('token', 'Bearer existing-bearer');
    expect(getBearerToken()).toBe('Bearer existing-bearer');
    expect(getAuthHeaders()).toEqual({ Authorization: 'Bearer existing-bearer' });
  });

  it('parses API errors for 401, 403, and generic errors', () => {
    expect(parseApiError({ response: { status: 401 } }, 'Fallback')).toEqual({
      status: 401,
      message: '401 Unauthorized: Your session has expired or is invalid. Please log in again.',
    });
    expect(parseApiError({ response: { status: 403 } }, 'Fallback')).toEqual({
      status: 403,
      message:
        '403 Forbidden: Access Denied. Administrator privileges are required to manage users.',
    });
    expect(parseApiError(new Error('Network down'), 'Fallback')).toEqual({
      status: null,
      message: 'Network down',
    });
  });

  it('normalizes array and object user responses', () => {
    const fromArray = normalizeUsersResponse(mockUsers, 1, 10);
    expect(fromArray.users).toHaveLength(2);
    expect(fromArray.total).toBe(2);

    const fromNested = normalizeUsersResponse(
      { data: { items: mockUsers, pagination: { page: 2, limit: 5, total: 12, totalPages: 3 } } },
      2,
      5,
    );
    expect(fromNested.users).toHaveLength(2);
    expect(fromNested.page).toBe(2);
    expect(fromNested.totalPages).toBe(3);
  });

  it('handles all reducer action types accurately', () => {
    let state = lbUserManagementReducer(undefined, {});
    expect(state).toEqual(initialState);

    state = lbUserManagementReducer(state, { type: FETCH_LB_USERS_REQUEST });
    expect(state.loading).toBe(true);

    state = lbUserManagementReducer(state, {
      type: FETCH_LB_USERS_SUCCESS,
      payload: { users: mockUsers, page: 1, limit: 10, total: 2, totalPages: 1, search: '' },
    });
    expect(state.loading).toBe(false);
    expect(state.users).toHaveLength(2);

    state = lbUserManagementReducer(state, { type: UPDATE_LB_USER_REQUEST });
    expect(state.actionLoading).toBe(true);

    state = lbUserManagementReducer(state, {
      type: UPDATE_LB_USER_SUCCESS,
      payload: { userId: 'user-1', updatedUser: { firstName: 'UpdatedAlice' } },
    });
    expect(state.users[0].firstName).toBe('UpdatedAlice');

    state = lbUserManagementReducer(state, { type: DELETE_LB_USER_REQUEST });
    expect(state.actionLoading).toBe(true);

    state = lbUserManagementReducer(state, {
      type: DELETE_LB_USER_SUCCESS,
      payload: 'user-2',
    });
    expect(state.users).toHaveLength(1);
    expect(state.total).toBe(1);

    state = lbUserManagementReducer(state, {
      type: FETCH_LB_USERS_FAILURE,
      payload: { message: 'Unauthorized', status: 401 },
    });
    expect(state.error).toBe('Unauthorized');
    expect(state.errorStatus).toBe(401);

    state = lbUserManagementReducer(state, {
      type: UPDATE_LB_USER_FAILURE,
      payload: { message: 'Forbidden', status: 403 },
    });
    expect(state.errorStatus).toBe(403);

    state = lbUserManagementReducer(state, {
      type: DELETE_LB_USER_FAILURE,
      payload: { message: 'Delete error', status: 500 },
    });
    expect(state.error).toBe('Delete error');

    state = lbUserManagementReducer(state, setLBUsersPage(3));
    expect(state.page).toBe(3);

    state = lbUserManagementReducer(state, setLBUsersLimit(20));
    expect(state.limit).toBe(20);
    expect(state.page).toBe(1);

    state = lbUserManagementReducer(state, setLBUsersSearch('bob'));
    expect(state.search).toBe('bob');

    state = lbUserManagementReducer(state, clearLBUsersError());
    expect(state.error).toBeNull();
    expect(state.errorStatus).toBeNull();
  });
});
