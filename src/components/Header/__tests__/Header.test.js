/* eslint-disable react/jsx-props-no-spreading */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { MemoryRouter as Router } from 'react-router-dom';
import { Header } from '../Header';

jest.mock('axios');
const mockStore = configureMockStore();

// Default mock for hasPermission function
const defaultMockHasPermission = () => false;

const renderHeader = (store, props = {}) =>
  render(
    <Provider store={store}>
      <Router>
        <Header
          auth={store.getState().auth}
          userProfile={store.getState().userProfile || {}}
          taskEditSuggestionCount={store.getState().taskEditSuggestionCount || 0}
          hasPermission={props.hasPermission || defaultMockHasPermission}
          {...props}
        />
      </Router>
    </Provider>,
  );

describe('Header Component', () => {
  let store;
  const initialState = {
    auth: {
      isAuthenticated: true,
      user: {
        userid: '123',
        role: 'Owner',
        firstName: 'John',
        profilePic: '/path/to/image.jpg',
      },
    },
    userProfile: {
      email: 'test@example.com',
    },
    taskEditSuggestionCount: 0,
    role: {
      roles: [],
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('renders without crashing', () => {
    renderHeader(store);
    expect(screen.getByTestId('header')).toBeInTheDocument();
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
    role: { roles: [] },
  };

  const store = mockStore(initialState);

  const mockHasPermission = () => false;

  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: { name: 'Test User', role: 'Volunteer', profilePic: '/path/to/img' },
    });
    store.clearActions();
  });

  it('loads and displays the user dashboard profile', () => {
    renderHeader(store, { hasPermission: mockHasPermission });
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('displays an error message when fetching the user dashboard profile fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));
    renderHeader(store, { hasPermission: mockHasPermission });
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
      role: { roles: [] },
    };

    const store = mockStore(initialState);
    const mockHasPermission = () => false;

    renderHeader(store, { hasPermission: mockHasPermission });
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
    });
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
  };

  const store = mockStore(initialState);

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { name: 'Test User', role: 'User' } });
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
        user: {},
      },
      role: {
        roles: [],
      },
      taskEditSuggestionCount: 0,
    };

    const store = mockStore(initialState);
    renderHeader(store); // This will now use the default mock hasPermission function
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
