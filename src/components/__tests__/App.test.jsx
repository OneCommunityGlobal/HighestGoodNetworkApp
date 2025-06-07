// src/components/__tests__/App.test.jsx
// @version 3.0.0

import React from 'react';
import { cleanup, render } from '@testing-library/react';

// === Stub out chart.js so Chart.register, LineController, etc. all exist ===
vi.mock('chart.js', () => {
  class Chart {
    static register(..._args) { /* no-op */ }
  }
  return {
    __esModule: true,
    Chart,
    CategoryScale: class {},
    LinearScale: class {},
    BarController: class {},
    LineController: class {},    // ← ensure this export exists
    BarElement: class {},
    LineElement: class {},
    PointElement: class {},
    Title: class {},
    Tooltip: class {},
    Legend: class {},
  };
});

// === Stub react-chartjs-2 so <Bar> and <Line> just render null ===
vi.mock('react-chartjs-2', () => ({
  __esModule: true,
  Bar: () => null,
  Line: () => null,
}));

// === Stub out your authActions with every export your components import ===
vi.mock('../../actions/authActions', () => {
  const logoutUser     = vi.fn(() => ({ type: 'LOGOUT_USER' }));
  const setCurrentUser = vi.fn(user => ({ type: 'SET_CURRENT_USER', payload: user }));
  const getHeaderData  = vi.fn(() => ({ type: 'GET_HEADER_DATA' }));
  const getAllRoles    = vi.fn(() => ({ type: 'GET_ALL_ROLES' }));
  const hasPermission  = vi.fn(() => ({ type: 'HAS_PERMISSION' }));
  return {
    __esModule: true,
    logoutUser,
    setCurrentUser,
    getHeaderData,
    getAllRoles,
    hasPermission,
  };
});

// Bypass other problematic modules
vi.mock('popper.js',                () => ({}));
vi.mock('react-leaflet',            () => ({}));
vi.mock('react-leaflet-cluster',    () => ({}));
vi.mock('redux-persist/integration/react', () => ({ PersistGate: ({ children }) => children }));

afterEach(() => {
  cleanup();
  vi.resetModules();
  localStorage.clear();
});

describe('App Initialization Token Checks', () => {
  let dispatchSpy, setjwtMock, logoutUser, setCurrentUser, config;

  beforeEach(() => {
    localStorage.clear();
    dispatchSpy = vi.fn();

    // Mock store
    vi.doMock('../../store', () => ({
      __esModule: true,
      default: () => ({
        persistor: {
          subscribe: vi.fn(),
          dispatch: vi.fn(),
          getState:  vi.fn(() => ({ bootstrapped: true })),
          persist:   vi.fn(),
          flush:     vi.fn(),
        },
        store: { dispatch: dispatchSpy },
      }),
    }));

    // Mock httpService
    setjwtMock = vi.fn();
    vi.doMock('../../services/httpService', () => ({
      __esModule: true,
      default: { setjwt: setjwtMock },
    }));

    // Grab our already-mocked authActions
    // eslint-disable-next-line global-require
    ({ logoutUser, setCurrentUser } = require('../../actions/authActions'));
    // Load config
    // eslint-disable-next-line global-require
    config = require('../../config.json');
  });

  it('should log out the user if the token is expired', async () => {
    const { tokenKey } = config;
    localStorage.setItem(tokenKey, 'expiredToken');

    // Mock jwt-decode to return an expiry in 100ms
    vi.doMock('jwt-decode', () => ({
      __esModule: true,
      default: () => ({ expiryTimestamp: Date.now() + 100 }),
    }));

    await import('../App.jsx');

    expect(logoutUser).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(logoutUser());
    expect(setjwtMock).not.toHaveBeenCalled();
  });

  it('should set current user and call setjwt if token is valid', async () => {
    const { tokenKey } = config;
    localStorage.setItem(tokenKey, 'validToken');

    const validExpiry = Date.now() + 86400 * 3 * 1000;
    const decodedPayload = { expiryTimestamp: validExpiry, name: 'Test User' };

    vi.doMock('jwt-decode', () => ({
      __esModule: true,
      default: () => decodedPayload,
    }));

    await import('../App.jsx');

    expect(setCurrentUser).toHaveBeenCalledWith(decodedPayload);
    expect(dispatchSpy).toHaveBeenCalledWith(setCurrentUser(decodedPayload));
    expect(setjwtMock).toHaveBeenCalledWith('validToken');
  });

  it('should not dispatch any token actions if no token exists in localStorage', async () => {
    const { tokenKey } = config;
    localStorage.removeItem(tokenKey);

    vi.doMock('jwt-decode', () => ({
      __esModule: true,
      default: () => { throw new Error('should not be called'); },
    }));

    await import('../App.jsx');

    expect(logoutUser).not.toHaveBeenCalled();
    expect(setCurrentUser).not.toHaveBeenCalled();
    expect(setjwtMock).not.toHaveBeenCalled();
  });
});

describe('App Component Rendering', () => {
  let App;

  beforeAll(async () => {
    vi.resetModules();
    // we keep authActions mocked so CPHeader always finds its action creators
    localStorage.clear();
    const mod = await import('../App.jsx');
    App = mod.default;
  });

  let consoleErrorSpy;
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
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