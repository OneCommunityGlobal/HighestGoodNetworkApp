// Version 1.0.0 - Updated tests for Login page structure, input handling, and login behavior
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Login } from '../Login';

// Mock required modules and actions
jest.mock('../../../actions/authActions', () => ({
  loginUser: jest.fn(),
}));
jest.mock('../../../actions/errorsActions', () => ({
  clearErrors: jest.fn(),
}));

// Create mock store
const mockStore = configureStore([thunk]);

// Custom render function with all required providers
const renderWithProviders = (
  ui,
  {
    initialState = {
      auth: { isAuthenticated: false, user: {} },
      errors: {},
      theme: { darkMode: false },
    },
    history = createMemoryHistory(),
    store = mockStore(initialState),
    ...renderOptions
  } = {},
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <Router history={history}>{children}</Router>
      </Provider>
    );
  }

  return {
    store,
    history,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

describe('Login page structure', () => {
  let store;
  let history;

  beforeEach(() => {
    // Set up store and history for each test
    const initialState = {
      auth: { isAuthenticated: false, user: {} },
      errors: {},
      theme: { darkMode: false },
    };
    store = mockStore(initialState);
    history = createMemoryHistory();

    // Render the Login component
    const { container } = renderWithProviders(
      <Login
        auth={{ isAuthenticated: false, user: {} }}
        errors={{}}
        loginUser={jest.fn()}
        clearErrors={jest.fn()}
        history={history}
        location={{}}
      />,
      { store, history },
    );

    // Add container to global scope for tests that need to query it
    global.container = container;
  });

  afterEach(() => {
    delete global.container;
  });

  it('should be rendered with two input fields', () => {
    // Use query selectors since the Input component might not have proper roles
    const inputs = global.container.querySelectorAll('input');
    expect(inputs.length).toBe(2);
  });

  it('should be rendered with one button', () => {
    const button = global.container.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('should be rendered with one h2 labeled Please Sign In', () => {
    const h2 = global.container.querySelector('h2');
    expect(h2).toBeTruthy();
    expect(h2.textContent).toContain('Please Sign in');
  });
});

describe('When user tries to input data', () => {
  let store;
  let history;
  let loginUserMock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh mocks for each test
    loginUserMock = jest.fn();
    const initialState = {
      auth: { isAuthenticated: false, user: {} },
      errors: {},
      theme: { darkMode: false },
    };
    store = mockStore(initialState);
    history = createMemoryHistory();

    // Render the Login component with mocks
    const { container } = renderWithProviders(
      <Login
        auth={{ isAuthenticated: false, user: {} }}
        errors={{}}
        loginUser={loginUserMock}
        clearErrors={jest.fn()}
        history={history}
        location={{}}
      />,
      { store, history },
    );

    global.container = container;
  });

  afterEach(() => {
    delete global.container;
  });

  // Use fireEvent instead of direct state manipulation
  it('should allow typing in the email field', () => {
    const emailInput = global.container.querySelector('input[name="email"]');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should allow typing in the password field', () => {
    const passwordInput = global.container.querySelector('input[name="password"]');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  it('should have disabled submit button initially (when form is invalid)', () => {
    const button = global.container.querySelector('button');
    expect(button.disabled).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    const emailInput = global.container.querySelector('input[name="email"]');
    const passwordInput = global.container.querySelector('input[name="password"]');

    // Fill in valid values
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Button should now be enabled
    const button = global.container.querySelector('button');
    expect(button.disabled).toBeFalsy();
  });

  it('should call loginUser when form is submitted', async () => {
    const emailInput = global.container.querySelector('input[name="email"]');
    const passwordInput = global.container.querySelector('input[name="password"]');
    const form = global.container.querySelector('form');

    // Fill in valid values
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.submit(form);

    // Check if loginUser was called with correct data
    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});

describe('Login behavior', () => {
  it('should redirect to homepage if user is authenticated', () => {
    const history = createMemoryHistory();
    const pushSpy = jest.spyOn(history, 'push');

    renderWithProviders(
      <Login
        auth={{ isAuthenticated: true, user: {} }}
        errors={{}}
        loginUser={jest.fn()}
        clearErrors={jest.fn()}
        history={history}
        location={{}}
      />,
      {
        initialState: {
          auth: { isAuthenticated: true, user: {} },
          errors: {},
          theme: { darkMode: false },
        },
        history,
      },
    );

    // Check if history.push was called with '/'
    expect(pushSpy).toHaveBeenCalledWith('/');
  });

  it('should redirect to /forcePasswordUpdate if user is new', () => {
    const history = createMemoryHistory();
    const pushSpy = jest.spyOn(history, 'push');

    // First render with isAuthenticated: false
    const { rerender } = renderWithProviders(
      <Login
        auth={{
          isAuthenticated: false,
          user: {},
        }}
        errors={{}}
        loginUser={jest.fn()}
        clearErrors={jest.fn()}
        history={history}
        location={{}}
      />,
      {
        initialState: {
          auth: {
            isAuthenticated: false,
            user: {},
          },
          errors: {},
          theme: { darkMode: false },
        },
        history,
      },
    );

    // Clear previous history.push calls
    pushSpy.mockClear();

    // Now rerender with isAuthenticated: true and user.new: true
    rerender(
      <Login
        auth={{
          isAuthenticated: true,
          user: { new: true, userId: '123' },
        }}
        errors={{}}
        loginUser={jest.fn()}
        clearErrors={jest.fn()}
        history={history}
        location={{}}
      />,
    );

    // Now componentDidUpdate should be called, pushing to /forcePasswordUpdate/123
    expect(pushSpy).toHaveBeenCalledWith('/forcePasswordUpdate/123');
  });
  it('should redirect to /dashboard when user becomes authenticated and is not new', () => {
    const history = createMemoryHistory();
    const pushSpy = jest.spyOn(history, 'push');

    // First render with isAuthenticated: false
    const { rerender } = renderWithProviders(
      <Login
        auth={{
          isAuthenticated: false,
          user: {},
        }}
        errors={{}}
        loginUser={jest.fn()}
        clearErrors={jest.fn()}
        history={history}
        location={{}}
      />,
      {
        initialState: {
          auth: {
            isAuthenticated: false,
            user: {},
          },
          errors: {},
          theme: { darkMode: false },
        },
        history,
      },
    );

    // Clear previous history.push calls
    pushSpy.mockClear();

    // Now rerender with isAuthenticated: true and regular user
    rerender(
      <Login
        auth={{
          isAuthenticated: true,
          user: { new: false },
        }}
        errors={{}}
        loginUser={jest.fn()}
        clearErrors={jest.fn()}
        history={history}
        location={{}}
      />,
    );

    // Should redirect to dashboard
    expect(pushSpy).toHaveBeenCalledWith('/dashboard');
  });
});

