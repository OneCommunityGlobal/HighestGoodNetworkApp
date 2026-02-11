import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import CPLogin from '../CPLogin';
import { makeStore, renderWithStoreRouter } from './renderWithStoreRouter';

vi.mock('axios');

vi.mock('jwt-decode', () => ({
  default: vi.fn(() => ({ decodedPayload: 'mocked_decoded_payload' })),
}));

const history = {
  push: vi.fn(),
  location: { pathname: '/' },
};

const renderCPLogin = store => {
  function LoginWrapper() {
    const dispatch = useDispatch();
    const location = {};
    return <CPLogin dispatch={dispatch} history={history} location={location} />;
  }

  return renderWithStoreRouter(<LoginWrapper />, { store });
};

const getFormEls = () => {
  const email = screen.getByRole('textbox', { name: /email/i });
  const password = screen.getByLabelText(/password/i);
  const submit = screen.getByRole('button', { name: /submit/i });
  return { email, password, submit };
};

const fillAndSubmit = ({ emailValue, passwordValue }) => {
  const { email, password, submit } = getFormEls();
  fireEvent.change(email, { target: { value: emailValue } });
  fireEvent.change(password, { target: { value: passwordValue } });
  fireEvent.click(submit);
  return { email, password, submit };
};

describe('CPLogin component', () => {
  let store;

  beforeEach(() => {
    history.push.mockClear();
    store = makeStore();
  });

  it('renders without crashing', () => {
    renderCPLogin(store);
  });

  it('shows login elements when isAuthenticated is true', () => {
    renderCPLogin(store);
    expect(screen.getByText('Log In To Community Portal')).toBeInTheDocument();
  });

  it('does not show login elements when isAuthenticated is false', () => {
    const testStore = makeStore({ auth: { isAuthenticated: false } });
    renderCPLogin(testStore);
    expect(screen.queryByText('Log In To Community Portal')).not.toBeInTheDocument();
  });

  it('shows the header text', () => {
    renderCPLogin(store);
    expect(
      screen.getByText(
        'Enter your current user credentials to access the Community Portal Dashboard',
      ),
    ).toBeInTheDocument();
  });

  it('shows the note text', () => {
    renderCPLogin(store);
    expect(
      screen.getByText('Note: You must use your Production/Main credentials for this login.'),
    ).toBeInTheDocument();
  });

  it('shows email label', () => {
    renderCPLogin(store);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows password label', () => {
    renderCPLogin(store);
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('disables submit when email or password is missing', () => {
    renderCPLogin(store);
    const { submit } = getFormEls();
    expect(submit).toBeDisabled();
  });

  it('validates invalid email', () => {
    renderCPLogin(store);

    const { email } = fillAndSubmit({ emailValue: 'test', passwordValue: '12' });

    expect(email).toBeInvalid();
    expect(screen.getByText('"email" must be a valid email')).toBeInTheDocument();
  });

  it('validates short password', () => {
    renderCPLogin(store);

    const { password } = fillAndSubmit({ emailValue: 'test@gmail.com', passwordValue: '12' });

    expect(password).toBeInvalid();
    expect(
      screen.getByText('"password" length must be at least 8 characters long'),
    ).toBeInTheDocument();
  });

  it('logs in on valid credentials and redirects', async () => {
    axios.post.mockResolvedValue({
      statusText: 'OK',
      data: { token: '1234' },
    });

    renderCPLogin(store);

    const { email, password } = fillAndSubmit({
      emailValue: 'test@gmail.com',
      passwordValue: 'Test12345',
    });

    await waitFor(() => expect(email).not.toBeInvalid());
    expect(password).not.toBeInvalid();

    await waitFor(() => {
      expect(history.push).toHaveBeenCalledWith('/communityportal');
    });
  });

  it("shows validation error when statusText !== 'OK' and status is 422", async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 422,
      data: { token: '1234', label: 'email', message: 'User not found' },
    });

    renderCPLogin(store);

    fillAndSubmit({ emailValue: 'test@gmail.com', passwordValue: 'Test12345' });

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it("does not show validation error when statusText !== 'OK' and status is not 422", async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 500,
      data: { token: '1234' },
    });

    renderCPLogin(store);

    const { password } = fillAndSubmit({
      emailValue: 'test@gmail.com',
      passwordValue: 'Test12345',
    });

    await waitFor(() => expect(password).not.toBeInvalid());
  });

  it('handles failed post request without displaying validation error', async () => {
    axios.post.mockRejectedValue({ response: 'server error' });

    renderCPLogin(store);

    const { password } = fillAndSubmit({
      emailValue: 'test@gmail.com',
      passwordValue: 'Test12345',
    });

    await waitFor(() => expect(password).not.toBeInvalid());
  });
});
