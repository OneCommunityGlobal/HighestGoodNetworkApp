import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Login, MESSAGES, describeLoginError, validateField } from '../Login';

vi.mock('../../../actions/authActions', () => ({
  loginUser: vi.fn(),
}));
vi.mock('../../../actions/errorsActions', () => ({
  clearErrors: vi.fn(),
}));

const mockStore = configureMockStore([thunk]);

const renderWithProviders = (ui, { history = createMemoryHistory() } = {}) => {
  const store = mockStore({
    auth: { isAuthenticated: false, user: {} },
    errors: {},
    theme: { darkMode: false },
  });
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <Router history={history}>{children}</Router>
      </Provider>
    );
  }
  return { store, history, ...render(ui, { wrapper: Wrapper }) };
};

const baseProps = overrides => ({
  auth: { isAuthenticated: false, user: {} },
  errors: {},
  darkMode: false,
  loginUser: vi.fn(),
  clearErrors: vi.fn(),
  history: createMemoryHistory(),
  location: {},
  ...overrides,
});

const emailInput = () => screen.getByLabelText('Email');
const passwordInput = () => screen.getByLabelText('Password');
const submitButton = () => screen.getByRole('button', { name: /sign in/i });

describe('Login page structure', () => {
  it('renders an email field and a password field', () => {
    renderWithProviders(<Login {...baseProps()} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(emailInput()).toHaveAttribute('type', 'email');
    expect(passwordInput()).toHaveAttribute('type', 'password');
  });

  it('gives password managers the right autocomplete hints', () => {
    renderWithProviders(<Login {...baseProps()} />);
    expect(emailInput()).toHaveAttribute('autocomplete', 'username');
    expect(passwordInput()).toHaveAttribute('autocomplete', 'current-password');
  });

  it('renders a "Sign in" level-one heading and the One Community logo', () => {
    renderWithProviders(<Login {...baseProps()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /one community/i })).toBeInTheDocument();
  });

  it('keeps the sign in button enabled before anything is typed', () => {
    renderWithProviders(<Login {...baseProps()} />);
    expect(submitButton()).toBeEnabled();
  });

  it('links to the forgot password page and keeps the Netlify credit', () => {
    renderWithProviders(<Login {...baseProps()} />);
    expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute(
      'href',
      '/forgotpassword',
    );
    expect(screen.getByRole('link', { name: 'Netlify' })).toHaveAttribute(
      'href',
      'https://www.netlify.com',
    );
  });

  it('applies the dark theme when darkMode is on', () => {
    renderWithProviders(<Login {...baseProps({ darkMode: true })} />);
    expect(screen.getByTestId('login-page')).toHaveAttribute('data-appearance', 'dark');
  });
});

describe('Validation timing', () => {
  it('shows no errors while the email is being typed', () => {
    renderWithProviders(<Login {...baseProps()} />);
    fireEvent.change(emailInput(), { target: { value: 'a' } });
    expect(screen.queryByText(MESSAGES.emailInvalid)).not.toBeInTheDocument();
    expect(screen.queryByText(MESSAGES.passwordRequired)).not.toBeInTheDocument();
    expect(emailInput()).not.toHaveAttribute('aria-invalid');
  });

  it('flags a malformed email when the field loses focus', () => {
    renderWithProviders(<Login {...baseProps()} />);
    fireEvent.change(emailInput(), { target: { value: 'kavya@gmail' } });
    fireEvent.blur(emailInput());
    expect(screen.getByText(MESSAGES.emailInvalid)).toBeInTheDocument();
    expect(emailInput()).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput()).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('does not flag an empty field just for being tabbed past', () => {
    renderWithProviders(<Login {...baseProps()} />);
    fireEvent.blur(emailInput());
    fireEvent.blur(passwordInput());
    expect(screen.queryByText(MESSAGES.emailRequired)).not.toBeInTheDocument();
    expect(screen.queryByText(MESSAGES.passwordRequired)).not.toBeInTheDocument();
  });

  it('clears an email error as soon as the value becomes valid', () => {
    renderWithProviders(<Login {...baseProps()} />);
    fireEvent.change(emailInput(), { target: { value: 'kavya@gmail' } });
    fireEvent.blur(emailInput());
    fireEvent.change(emailInput(), { target: { value: 'kavya@gmail.com' } });
    expect(screen.queryByText(MESSAGES.emailInvalid)).not.toBeInTheDocument();
    expect(emailInput()).not.toHaveAttribute('aria-invalid');
  });

  it('reports both empty fields on submit and focuses the email field', () => {
    const loginUser = vi.fn();
    renderWithProviders(<Login {...baseProps({ loginUser })} />);
    fireEvent.click(submitButton());
    expect(screen.getByText(MESSAGES.emailRequired)).toBeInTheDocument();
    expect(screen.getByText(MESSAGES.passwordRequired)).toBeInTheDocument();
    expect(emailInput()).toHaveFocus();
    expect(loginUser).not.toHaveBeenCalled();
  });
});

describe('Submitting', () => {
  it('lower-cases the email and calls loginUser', async () => {
    const loginUser = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(<Login {...baseProps({ loginUser })} />);
    fireEvent.change(emailInput(), { target: { value: 'TEST@Example.com' } });
    fireEvent.change(passwordInput(), { target: { value: 'password123' } });
    fireEvent.click(submitButton());
    await waitFor(() =>
      expect(loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      }),
    );
  });

  it('accepts an email with surrounding spaces from autofill or paste', async () => {
    const loginUser = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(<Login {...baseProps({ loginUser })} />);
    fireEvent.change(emailInput(), { target: { value: '  volunteer@example.org ' } });
    fireEvent.blur(emailInput());
    expect(screen.queryByText(MESSAGES.emailInvalid)).not.toBeInTheDocument();
    fireEvent.change(passwordInput(), { target: { value: 'pw' } });
    fireEvent.click(submitButton());
    await waitFor(() =>
      expect(loginUser).toHaveBeenCalledWith({ email: 'volunteer@example.org', password: 'pw' }),
    );
  });

  it('submits when Enter is pressed in the password field', async () => {
    const loginUser = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(<Login {...baseProps({ loginUser })} />);
    fireEvent.change(emailInput(), { target: { value: 'a@example.org' } });
    fireEvent.change(passwordInput(), { target: { value: 'pw' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Sign in' }));
    await waitFor(() => expect(loginUser).toHaveBeenCalledTimes(1));
  });

  it('shows a busy state and ignores a second submit while signing in', async () => {
    let resolve;
    const loginUser = vi.fn(
      () =>
        new Promise(r => {
          resolve = r;
        }),
    );
    renderWithProviders(<Login {...baseProps({ loginUser })} />);
    fireEvent.change(emailInput(), { target: { value: 'a@example.org' } });
    fireEvent.change(passwordInput(), { target: { value: 'pw' } });
    fireEvent.click(submitButton());
    const busy = await screen.findByRole('button', { name: /signing in/i });
    expect(busy).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(busy);
    expect(loginUser).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ success: true }));
    expect(screen.getByRole('button', { name: 'Sign in' })).toHaveAttribute('aria-busy', 'false');
  });

  it('shows a wrong-password alert with a reset link when the server rejects the password', async () => {
    const loginUser = vi
      .fn()
      .mockResolvedValue({ success: false, errors: { password: 'Invalid password.' } });
    renderWithProviders(<Login {...baseProps({ loginUser })} />);
    fireEvent.change(emailInput(), { target: { value: 'a@example.org' } });
    fireEvent.change(passwordInput(), { target: { value: 'wrong' } });
    fireEvent.click(submitButton());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/password doesn.t match this account/i);
    expect(screen.getByRole('link', { name: /reset your password/i })).toHaveAttribute(
      'href',
      '/forgotpassword',
    );
  });

  it('clears the server alert once the person edits a field', async () => {
    const loginUser = vi
      .fn()
      .mockResolvedValue({ success: false, errors: { email: 'Username not found.' } });
    renderWithProviders(<Login {...baseProps({ loginUser })} />);
    fireEvent.change(emailInput(), { target: { value: 'a@example.org' } });
    fireEvent.change(passwordInput(), { target: { value: 'pw' } });
    fireEvent.click(submitButton());
    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGES.noAccount);
    fireEvent.change(emailInput(), { target: { value: 'b@example.org' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Password field', () => {
  it('toggles visibility with an accessible button', () => {
    renderWithProviders(<Login {...baseProps()} />);
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(passwordInput()).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('warns when Caps Lock is on', () => {
    renderWithProviders(<Login {...baseProps()} />);
    const event = new KeyboardEvent('keyup', { key: 'A', bubbles: true });
    event.getModifierState = key => key === 'CapsLock';
    act(() => {
      passwordInput().dispatchEvent(event);
    });
    expect(screen.getByText('Caps Lock is on.')).toBeInTheDocument();
  });
});

describe('Helpers', () => {
  it('validateField only reports empty fields on submit', () => {
    expect(validateField('email', '')).toBeNull();
    expect(validateField('email', '', { onSubmit: true })).toBe(MESSAGES.emailRequired);
    expect(validateField('email', ' a@b.org ')).toBeNull();
    expect(validateField('email', 'a@b')).toBe(MESSAGES.emailInvalid);
    expect(validateField('password', '')).toBeNull();
    expect(validateField('password', '', { onSubmit: true })).toBe(MESSAGES.passwordRequired);
  });

  it('describeLoginError maps each server outcome', () => {
    expect(describeLoginError({})).toBeNull();
    expect(describeLoginError({ password: 'Invalid password.' })).toEqual({
      field: 'password',
      kind: 'wrongPassword',
    });
    expect(describeLoginError({ email: 'An error occurred during login.' })).toEqual({
      field: null,
      message: MESSAGES.connection,
    });
    expect(describeLoginError({ email: 'Username not found.' }).message).toBe(MESSAGES.noAccount);
    const inactive = 'Sorry, this account is no longer active.';
    expect(describeLoginError({ email: inactive }).message).toBe(inactive);
  });
});

describe('Login redirection logic', () => {
  it('redirects to homepage if user is already authenticated', () => {
    const history = createMemoryHistory();
    const pushSpy = vi.spyOn(history, 'push');
    renderWithProviders(
      <Login {...baseProps({ auth: { isAuthenticated: true, user: {} }, history })} />,
      {
        history,
      },
    );
    expect(pushSpy).toHaveBeenCalledWith('/');
  });

  it('redirects to /forcePasswordUpdate if user is new', () => {
    const history = createMemoryHistory();
    const pushSpy = vi.spyOn(history, 'push');
    const { rerender } = renderWithProviders(<Login {...baseProps({ history })} />, { history });
    pushSpy.mockClear();
    rerender(
      <Login
        {...baseProps({
          history,
          auth: { isAuthenticated: true, user: { new: true, userId: '123' } },
        })}
      />,
    );
    expect(pushSpy).toHaveBeenCalledWith('/forcePasswordUpdate/123');
  });

  it('redirects to /dashboard when authenticated and not new', () => {
    const history = createMemoryHistory();
    const pushSpy = vi.spyOn(history, 'push');
    const { rerender } = renderWithProviders(<Login {...baseProps({ history })} />, { history });
    pushSpy.mockClear();
    rerender(
      <Login {...baseProps({ history, auth: { isAuthenticated: true, user: { new: false } } })} />,
    );
    expect(pushSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('returns to /hgnform when that is where the person came from', () => {
    const history = createMemoryHistory();
    const pushSpy = vi.spyOn(history, 'push');
    const location = { state: { from: { pathname: '/hgnform/page2' } } };
    const { rerender } = renderWithProviders(<Login {...baseProps({ history, location })} />, {
      history,
    });
    pushSpy.mockClear();
    rerender(
      <Login {...baseProps({ history, location, auth: { isAuthenticated: true, user: {} } })} />,
    );
    expect(pushSpy).toHaveBeenCalledWith('/hgnform/page2');
  });
});
