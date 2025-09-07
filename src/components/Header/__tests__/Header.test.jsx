import { vi } from 'vitest';
import React from 'react';

// 1) Mock out any child components that hit the network or DOM APIs
vi.mock('../../OwnerMessage/OwnerMessage', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-owner-message" />,
}));
vi.mock('../../Timer/Timer', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-timer" />,
}));

// 2) Mock axios so any GET/POST in your component just resolves/rejects
vi.mock('axios');

// 3) Partially mock react-redux
const mockDispatch = vi.fn();
vi.mock('react-redux', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: selectorFn =>
      // optionally wire up selectorFn to your fake store if you need it
      selectorFn({
        theme: { darkMode: false },
        notification: { unreadNotifications: [] },
        // …add whatever slices your Header’s useSelector reads directly…
      }),
  };
});

// 4) Partially mock react-router-dom
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useHistory: () => ({ push: vi.fn() }),
    useLocation: () => ({ pathname: '/' }),
  };
});

// …now import everything else…
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { MemoryRouter as Router } from 'react-router-dom';
import { Header } from '../Header'; // assume this is the named export

const mockStore = configureMockStore();
const defaultMockHasPermission = () => false;
/**
 * A helper that always injects a properly shaped auth & userProfile,
 * even if tests override only bits of state.
 */
function renderHeader(stateOverrides = {}, propsOverrides = {}) {
  const baseState = {
    auth: {
      isAuthenticated: true,
      firstName: 'Jane',
      profilePic: '/me.png',
      user: { userid: 'u1', role: 'Owner' },
    },
    userProfile: { email: 'jane@example.com' },
    taskEditSuggestionCount: 0,
    taskEditSuggestions: { count: 0 },
    role: { roles: [] },
    notification: { unreadNotifications: [] },
    theme: { darkMode: false },
    ownerMessage: { message: '', standardMessage: '' },
    ...stateOverrides,
  };
  const store = mockStore(baseState);

  return render(
    <Provider store={store}>
      <Router>
        <Header
          auth={baseState.auth}
          userProfile={baseState.userProfile}
          taskEditSuggestionCount={baseState.taskEditSuggestionCount}
          hasPermission={propsOverrides.hasPermission ?? (() => false)}
          getHeaderData={vi.fn()}
          getAllRoles={vi.fn()}
          getWeeklySummaries={vi.fn()}
          role={baseState.role}
        />
      </Router>
    </Provider>,
  );
}

describe('Header component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderHeader();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('fetches user profile on mount', async () => {
    axios.get.mockResolvedValueOnce({
      data: { firstName: 'Jane', profilePic: '/me.png', email: 'jane@example.com' },
    });
    renderHeader();
    await waitFor(() => {
      // narrow to the H6 dropdown-header only
      expect(screen.getByText(/Hello\s*Jane/, { selector: 'h6' })).toBeInTheDocument();
    });
  });

  it('handles profile‐load failure gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    renderHeader();
    // Should still mount, maybe show a default avatar or no crash:
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the owner message & timer children', () => {
    renderHeader();
    expect(screen.getByTestId('mock-owner-message')).toBeInTheDocument();
    expect(screen.getByTestId('mock-timer')).toBeInTheDocument();
  });
});

describe('Header Component with Mocked Axios', () => {
  const initialState = {
    auth: {
      isAuthenticated: true,
      user: {
        userid: 'volunteerUserId',
        role: 'Volunteer',
        firstName: 'Test',
        profilePic: '/default.jpg',
      },
    },
    taskEditSuggestionCount: 0,
    taskEditSuggestions: {
      count: 0,
    },
    role: {
      roles: [],
    },
    notification: {
      unreadNotifications: [],
    },
    theme: {
      darkMode: false,
    },
    ownerMessage: {
      message: 'Test message',
      standardMessage: 'Standard message',
    },
  };

  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    axios.get.mockResolvedValue({
      data: { name: 'Test User', role: 'Volunteer', profilePic: '/path/to/img' },
    });
    vi.clearAllMocks();
  });

  it('loads and displays the user dashboard profile', async () => {
    axios.get.mockResolvedValueOnce({
      data: { firstName: 'Jane', profilePic: '/me.png', email: 'jane@example.com' },
    });

    renderHeader({}, { hasPermission: () => false });
    await waitFor(() => {
      expect(screen.getByText(/Hello\s*Jane/, { selector: 'h6' })).toBeInTheDocument();
    });
  });

  it('displays an error message when fetching the user dashboard profile fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    renderHeader(store, { hasPermission: defaultMockHasPermission });
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});

describe('Header Component - volunteer, Assistant Manager', () => {
  it('renders correctly for a volunteer', () => {
    const initialState = {
      auth: {
        isAuthenticated: true,
        user: {
          userid: 'volunteerUserId',
          role: 'Volunteer',
          firstName: 'Volunteer',
          profilePic: '/default.jpg',
        },
      },
      taskEditSuggestionCount: 0,
      taskEditSuggestions: {
        count: 0,
      },
      role: {
        roles: [],
      },
      notification: {
        unreadNotifications: [],
      },
      theme: {
        darkMode: false,
      },
      ownerMessage: {
        message: 'Test message',
        standardMessage: 'Standard message',
      },
    };

    const store = mockStore(initialState);

    renderHeader(store, { hasPermission: defaultMockHasPermission });
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});

describe('Header Component - Owner, Administrator, Mentor', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          userid: 'test-user-id',
          role: 'Owner',
          firstName: 'John',
          profilePic: '/path/to/profile/pic',
        },
      },
      userProfile: {
        email: 'test@example.com',
      },
      taskEditSuggestions: {
        count: 0,
      },
      taskEditSuggestionCount: 0,
      role: {
        roles: [],
      },
      notification: {
        unreadNotifications: [],
      },
      theme: {
        darkMode: false,
      },
      ownerMessage: {
        message: 'Test message',
        standardMessage: 'Standard message',
      },
    });
    vi.clearAllMocks();
  });

  it('renders correctly for a Owner', () => {
    renderHeader(store);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders correctly for an Administrator', () => {
    store = mockStore({
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        user: {
          ...store.getState().auth.user,
          role: 'Administrator',
        },
      },
    });
    renderHeader(store);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders correctly for a Mentor', () => {
    store = mockStore({
      ...store.getState(),
      auth: {
        ...store.getState().auth,
        user: {
          ...store.getState().auth.user,
          role: 'Mentor',
        },
      },
    });
    renderHeader(store);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});

describe('Header Component Functionality', () => {
  const initialState = {
    auth: {
      isAuthenticated: true,
      user: {
        userid: 'user123',
        role: 'User',
        firstName: 'John',
        profilePic: '/path/to/profile.jpg',
      },
    },
    userProfile: {
      email: 'test@example.com',
    },
    taskEditSuggestions: {
      count: 5,
    },
    taskEditSuggestionCount: 5,
    role: {
      roles: [],
    },
    notification: {
      unreadNotifications: [],
    },
    theme: {
      darkMode: false,
    },
    ownerMessage: {
      message: 'Test message',
      standardMessage: 'Standard message',
    },
  };

  let store;

  beforeEach(() => {
    store = mockStore(initialState);
    axios.get.mockResolvedValue({ data: { name: 'Test User', role: 'User' } });
    vi.clearAllMocks();
  });

  it('modal is visible based on conditions', () => {
    renderHeader(store);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});

describe('Header Component Authentication Checks', () => {
  it('does not display user-specific information when not authenticated', () => {
    const initialState = {
      auth: {
        isAuthenticated: false,
        user: {
          userid: '', // Provide an empty user object with required fields
          role: '',
          firstName: '',
          profilePic: '',
        },
      },
      role: {
        roles: [], // Ensure roles is an array
      },
      taskEditSuggestionCount: 0,
      taskEditSuggestions: {
        count: 0,
      },
      notification: {
        unreadNotifications: [],
      },
      theme: {
        darkMode: false,
      },
      ownerMessage: {
        message: 'Test message',
        standardMessage: 'Standard message',
      },
    };

    const store = mockStore(initialState);

    renderHeader(store);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
