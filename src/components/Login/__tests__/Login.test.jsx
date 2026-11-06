import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Login } from '../Login';

vi.mock('../../../actions/authActions', () => ({
  loginUser: vi.fn(),
}));
vi.mock('../../../actions/errorsActions', () => ({
  clearErrors: vi.fn(),
}));

const mockStore = configureMockStore([thunk]);

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
  it('should render two input fields', () => {
    renderWithProviders(
      <Login
        auth={{ isAuthenticated: false, user: {} }}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    const passwordInput = screen.getByLabelText(/password/i);
    expect(inputs.length).toBe(1); // Email field only
    expect(passwordInput).toBeInTheDocument(); // Password uses type="password"
  });

  it('should render one submit button', () => {
    renderWithProviders(
      <Login
        auth={{}}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();
  });

  it('should render a heading with "Please Sign in"', () => {
    renderWithProviders(
      <Login
        auth={{}}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );
    const heading = screen.getByRole('heading', { name: /please sign in/i });
    expect(heading).toBeInTheDocument();
  });
});

describe('When user types input', () => {
  let loginUserMock;

  beforeEach(() => {
    vi.clearAllMocks();
    loginUserMock = vi.fn();
  });

  it('should allow typing in the email field', () => {
    renderWithProviders(
      <Login
        auth={{}}
        errors={{}}
        loginUser={loginUserMock}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should allow typing in the password field', () => {
    renderWithProviders(
      <Login
        auth={{}}
        errors={{}}
        loginUser={loginUserMock}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput).toHaveValue('password123');
  });

  it('should enable submit button when form is valid', () => {
    renderWithProviders(
      <Login
        auth={{}}
        errors={{}}
        loginUser={loginUserMock}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(button).not.toBeDisabled();
  });
  it('should have disabled submit button initially when form is invalid', () => {
    renderWithProviders(
      <Login
        auth={{}}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );

    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeDisabled();
  });
  it('should call loginUser on form submit', async () => {
    renderWithProviders(
      <Login
        auth={{}}
        errors={{}}
        loginUser={loginUserMock}
        clearErrors={vi.fn()}
        history={createMemoryHistory()}
        location={{}}
      />,
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'TEST@Example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});

describe('Login redirection logic', () => {
  it('redirects to homepage if user is already authenticated', () => {
    const history = createMemoryHistory();
    const pushSpy = vi.spyOn(history, 'push');

    renderWithProviders(
      <Login
        auth={{ isAuthenticated: true, user: {} }}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={history}
        location={{}}
      />,
      { history },
    );

    expect(pushSpy).toHaveBeenCalledWith('/');
  });

  it('redirects to /forcePasswordUpdate if user is new', () => {
    const history = createMemoryHistory();
    const pushSpy = vi.spyOn(history, 'push');

    const { rerender } = renderWithProviders(
      <Login
        auth={{ isAuthenticated: false, user: {} }}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={history}
        location={{}}
      />,
      { history },
    );

    pushSpy.mockClear();

    rerender(
      <Login
        auth={{ isAuthenticated: true, user: { new: true, userId: '123' } }}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={history}
        location={{}}
      />,
    );

    expect(pushSpy).toHaveBeenCalledWith('/forcePasswordUpdate/123');
  });

  it('redirects to /dashboard when authenticated and not new', () => {
    const history = createMemoryHistory();
    const pushSpy = vi.spyOn(history, 'push');

    const { rerender } = renderWithProviders(
      <Login
        auth={{ isAuthenticated: false, user: {} }}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={history}
        location={{}}
      />,
      { history },
    );

    pushSpy.mockClear();

    rerender(
      <Login
        auth={{ isAuthenticated: true, user: { new: false } }}
        errors={{}}
        loginUser={vi.fn()}
        clearErrors={vi.fn()}
        history={history}
        location={{}}
      />,
    );

    expect(pushSpy).toHaveBeenCalledWith('/dashboard');
  });
});
