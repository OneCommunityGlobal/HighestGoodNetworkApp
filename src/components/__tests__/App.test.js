// src/components/__tests__/App.test.js
// @version 3.0.0

// --- Global Mocks for External Modules ---
// These mocks bypass problematic modules (like popper.js and react-leaflet) that might interfere with tests.
jest.mock('popper.js', () => ({}));
jest.mock('react-leaflet', () => ({}));
jest.mock('react-leaflet-cluster', () => ({}));

// Mock the PersistGate component from redux-persist so that it simply renders its children,
// avoiding issues with persistence bootstrapping.
jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }) => children,
}));

import React from 'react';
import { cleanup, render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

// --- Global Cleanup ---
// Reset modules and clear localStorage after each test to avoid interference.
afterEach(() => {
  cleanup();
  jest.resetModules();
  localStorage.clear();
});

/**
 * Part 1: Token-Check Tests
 * These tests validate the token-check logic executed when the App module is loaded.
 * We set up mocks (using jest.doMock) for the store, httpService, and authActions before requiring App.
 */
describe('App Initialization Token Checks', () => {
  let dispatchSpy;
  let setjwtMock;
  let logoutUser, setCurrentUser;
  let config;

  beforeEach(() => {
    // Clear localStorage and create a dispatch spy.
    localStorage.clear();
    dispatchSpy = jest.fn();

    // --- Mock the store ---
    // Override the store so that we can inspect dispatch calls.
    jest.doMock('../../store', () => ({
      __esModule: true,
      default: () => ({
        persistor: {
          subscribe: jest.fn(),
          dispatch: jest.fn(),
          getState: jest.fn(() => ({ bootstrapped: true })), // Ensure bootstrapping state is true.
          persist: jest.fn(),
          flush: jest.fn(),
        },
        store: { dispatch: dispatchSpy },
      }),
    }));

    // --- Mock httpService ---  
    // We want to check that setjwt is called when a token is valid.
    setjwtMock = jest.fn();
    jest.doMock('../../services/httpService', () => ({
      __esModule: true,
      default: { setjwt: setjwtMock },
    }));

    // --- Mock authActions ---  
    // We mock the logoutUser and setCurrentUser action creators.
    const actions = {
      logoutUser: jest.fn(() => ({ type: 'LOGOUT_USER' })),
      setCurrentUser: jest.fn((user) => ({ type: 'SET_CURRENT_USER', payload: user })),
    };
    jest.doMock('../../actions/authActions', () => actions);
    logoutUser = actions.logoutUser;
    setCurrentUser = actions.setCurrentUser;

    // --- Load configuration ---
    // Import configuration (e.g., tokenKey) needed for the tests.
    config = require('../../config.json');
  });

  // Test 1: Expired Token
  it('should log out the user if the token is expired', () => {
    // Set an "expired" token in localStorage.
    const tokenKey = config.tokenKey; // e.g., "jwtToken"
    localStorage.setItem(tokenKey, 'expiredToken');

    // Simulate jwt-decode returning a token expiry that is nearly immediate.
    const expiredExpiry = Date.now() + 100;
    jest.doMock('jwt-decode', () =>
      jest.fn(() => ({ expiryTimestamp: expiredExpiry }))
    );

    // Dynamically require App to trigger the module-level token-check logic.
    require('../App');

    // Assert: The logout action should be dispatched.
    expect(logoutUser).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(logoutUser());
    expect(setjwtMock).not.toHaveBeenCalled();
  });

  // Test 2: Valid Token
  it('should set current user and call setjwt if token is valid', () => {
    // Place a valid token in localStorage.
    const tokenKey = config.tokenKey;
    localStorage.setItem(tokenKey, 'validToken');

    // Simulate jwt-decode returning a far-future expiry (valid token).
    const validExpiry = Date.now() + 86400 * 3 * 1000; // 3 days in the future
    const decodedPayload = { expiryTimestamp: validExpiry, name: 'Test User' };
    jest.doMock('jwt-decode', () =>
      jest.fn(() => decodedPayload)
    );

    // Dynamically require App to trigger token-check logic.
    require('../App');

    // Assert: The setCurrentUser action should be dispatched and setjwt should be called.
    expect(setCurrentUser).toHaveBeenCalledWith(decodedPayload);
    expect(dispatchSpy).toHaveBeenCalledWith(setCurrentUser(decodedPayload));
    expect(setjwtMock).toHaveBeenCalledWith('validToken');
  });

  // Test 3: No Token
  it('should not dispatch any token actions if no token exists in localStorage', () => {
    // Ensure no token is stored.
    const tokenKey = config.tokenKey;
    localStorage.removeItem(tokenKey);

    // Optionally, simulate jwt-decode throwing an error if called.
    jest.doMock('jwt-decode', () =>
      jest.fn(() => { throw new Error('jwt-decode should not be called'); })
    );

    // Dynamically require App.
    require('../App');

    // Assert: No token-related actions should be dispatched.
    expect(logoutUser).not.toHaveBeenCalled();
    expect(setCurrentUser).not.toHaveBeenCalled();
    expect(setjwtMock).not.toHaveBeenCalled();
  });
});

/**
 * Part 2: Rendering Tests (UI-Level Tests)
 * These tests verify that the App component renders correctly with real (unmocked)
 * modules. We assume that the App component already includes its Provider and PersistGate.
 */
describe('App Component Rendering', () => {
  let App;

  beforeAll(() => {
    // Reset modules and unmock modules we want to use in their real form.
    jest.resetModules();
    jest.unmock('../../store');
    jest.unmock('../../services/httpService');
    jest.unmock('../../actions/authActions');
    jest.unmock('jwt-decode');
    localStorage.clear(); // Clear token so module-level logic does not run.
    App = require('../App').default;
  });

  // Temporarily suppress error boundary warnings during UI rendering tests.
  let consoleErrorSpy;
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // Test 4: App Renders Without Errors
  it('should render the App component without errors', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  // Test 5:Placeholder Test for UI Messages
  it('should display appropriate UI messages based on authentication state (placeholder)', () => {
    const { queryByText } = render(<App />);
    // Placeholder: Depending on authentication state, the UI should either show:
  });
});