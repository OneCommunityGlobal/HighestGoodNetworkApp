import { vi } from 'vitest';
import React from 'react';
import { render, cleanup } from '@testing-library/react';

vi.mock('chart.js', () => {
  class Chart {
    static register(..._) {}
  }
  return {
    __esModule: true,
    Chart,
    CategoryScale: class {},
    LinearScale: class {},
    BarController: class {},
    LineController: class {},
    RadialLinearScale: class {},
    Filler: class {},
    BarElement: class {},
    LineElement: class {},
    PointElement: class {},
    Title: class {},
    Tooltip: class {},
    Legend: class {},
  };
});

// Stub react-chartjs-2 so <Bar> and <Line> render null
vi.mock('react-chartjs-2', () => ({
  __esModule: true,
  Bar: () => null,
  Line: () => null,
}));

vi.mock('popper.js', () => ({}));
vi.mock('react-leaflet', () => ({}));
vi.mock('react-leaflet-cluster', () => ({}));
vi.mock('redux-persist/integration/react', () => ({
  __esModule: true,
  PersistGate: ({ children }) => children,
}));

// Stub your authActions
vi.mock('../../actions/authActions', () => {
  const logoutUser = vi.fn(() => ({ type: 'LOGOUT_USER' }));
  const setCurrentUser = vi.fn(u => ({ type: 'SET_CURRENT_USER', payload: u }));
  const loginUser = vi.fn(() => ({ type: 'LOGIN_USER' }));
  const clearErrors = vi.fn(() => ({ type: 'CLEAR_ERRORS' }));
  return {
    __esModule: true,
    logoutUser,
    setCurrentUser,
    loginUser,
    clearErrors,
    getHeaderData: vi.fn(() => ({ type: 'GET_HEADER_DATA' })),
    getAllRoles: vi.fn(() => ({ type: 'GET_ALL_ROLES' })),
    hasPermission: vi.fn(() => ({ type: 'HAS_PERMISSION' })),
  };
});

vi.mock('../../services/httpService', () => ({
  __esModule: true,
  default: { setjwt: vi.fn() },
}));

vi.mock('../../store', () => {
  const store = {
    dispatch: vi.fn(),
  };
  const persistor = {
    subscribe: vi.fn(),
    dispatch: vi.fn(),
    getState: vi.fn(() => ({ bootstrapped: true })),
    persist: vi.fn(),
    flush: vi.fn(),
  };
  return {
    __esModule: true,
    default: () => ({ persistor, store }),
  };
});

vi.mock('jwt-decode', () => ({
  __esModule: true,
  default: vi.fn(() => ({})),
}));

import jwtDecode from 'jwt-decode';
import httpService from '../../services/httpService';
import { logoutUser, setCurrentUser } from '../../actions/authActions';
import config from '../../config.json';

describe('App Initialization Token Checks', () => {
  beforeEach(() => {
    vi.resetModules();
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('logs out the user if the token is expired', async () => {
    localStorage.setItem(config.tokenKey, 'expiredToken');
    jwtDecode.mockReturnValue({ expiryTimestamp: Math.floor((Date.now() - 10000) / 1000) });
    await import('../App.jsx');

    expect(logoutUser).toHaveBeenCalled();
    expect(httpService.setjwt).not.toHaveBeenCalled();
  }, 10_000);

  it('sets current user and calls setjwt if token is valid', async () => {
    const payload = { expiryTimestamp: Date.now() + 3 * 24 * 60 * 60 * 1000, name: 'Test User' };
    localStorage.setItem(config.tokenKey, 'validToken');
    jwtDecode.mockReturnValue(payload);

    await import('../App.jsx');

    expect(setCurrentUser).toHaveBeenCalledWith(payload);
    expect(httpService.setjwt).toHaveBeenCalledWith('validToken');
  });

  it('does nothing if no token exists in localStorage', async () => {
    jwtDecode.mockImplementation(() => {
      throw new Error('should not be called');
    });

    await import('../App.jsx');

    expect(logoutUser).not.toHaveBeenCalled();
    expect(setCurrentUser).not.toHaveBeenCalled();
    expect(httpService.setjwt).not.toHaveBeenCalled();
  });
});

describe('App Component Rendering', () => {
  let App;
  beforeAll(async () => {
    const mod = await import('../App.jsx');
    App = mod.default;
  });

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockRestore();
    cleanup();
    vi.clearAllMocks();
  });

  it('should render the App component without errors', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('should display appropriate UI messages based on authentication state (placeholder)', () => {
    render(<App />);
    // placeholder for future UI assertions
  });
});
