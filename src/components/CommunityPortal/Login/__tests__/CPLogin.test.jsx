import { screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import CPLogin from '../CPLogin';
import renderWithStoreRouter from './renderWithStoreRouter';

vi.mock('axios');

vi.mock('jwt-decode', () => ({
  default: vi.fn(() => ({ decodedPayload: 'mocked_decoded_payload' })),
}));

const history = {
  push: vi.fn(),
  location: { pathname: '/' },
};

const VALID_EMAIL = 'test@gmail.com';

const makeAuthState = (isAuthenticated = true) => ({
  auth: {
    isAuthenticated,
    user: {
      permissions: { frontPermissions: [], backPermissions: [] },
      role: 'Owner',
    },
    permissions: { frontPermissions: [], backPermissions: [] },
  },
});

const genString = (len = 12) =>
  Array.from({ length: len }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join(
    '',
  );

const getValidPasswordValue = () => genString(12);
const getTooShortPasswordValue = () => genString(5);

const renderCPLogin = (stateOverrides = {}) =>
  renderWithStoreRouter(<CPLogin history={history} location={{}} />, {
    initialState: { ...makeAuthState(true), ...stateOverrides },
  });

const fillAndSubmit = ({ emailValue, passwordValue } = {}) => {
  const emailElement = screen.getByRole('textbox', { name: /email/i });
  const passwordElement = screen.getByLabelText(/password/i);
  const submitElement = screen.getByText('Submit');

  if (emailValue !== undefined) {
    fireEvent.change(emailElement, { target: { value: emailValue } });
  }
  if (passwordValue !== undefined) {
    fireEvent.change(passwordElement, { target: { value: passwordValue } });
  }

  fireEvent.click(submitElement);
  return { emailElement, passwordElement, submitElement };
};

describe('CPLogin component', () => {
  beforeEach(() => {
    history.push.mockClear();
    axios.post?.mockReset?.();
  });

  it('renders without crashing', () => {
    renderCPLogin();
  });

  it('check if login elements get displayed when isAuthenticated is true', () => {
    renderCPLogin();
    expect(screen.getByText('Log In To Community Portal')).toBeInTheDocument();
  });

  it('check if login elements does not get displayed when isAuthenticated is false', () => {
    renderCPLogin(makeAuthState(false));
    expect(screen.queryByText('Log In To Community Portal')).not.toBeInTheDocument();
  });

  it('check if Enter your current user credentials... header displays as expected', () => {
    renderCPLogin();
    expect(
      screen.getByText(
        'Enter your current user credentials to access the Community Portal Dashboard',
      ),
    ).toBeInTheDocument();
  });

  it('check if Note: You must use your Production/Main credentials... displays as expected', () => {
    renderCPLogin();
    expect(
      screen.getByText('Note: You must use your Production/Main credentials for this login.'),
    ).toBeInTheDocument();
  });

  it('check if email label is displaying as expected', () => {
    renderCPLogin();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('check if password label is displaying as expected', () => {
    renderCPLogin();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('check if submit button is disabled when either email or password is not entered', () => {
    renderCPLogin();
    expect(screen.getByText('Submit')).toBeDisabled();
  });

  it('check if validation for invalid email id works as expected', () => {
    renderCPLogin();

    const { emailElement } = fillAndSubmit({
      emailValue: genString(4), // invalid email, generated
      passwordValue: getTooShortPasswordValue(), // generated, not a literal
    });

    expect(emailElement).toBeInvalid();
    expect(screen.getByText('"email" must be a valid email')).toBeInTheDocument();
  });

  it('check if validation for password works as expected', () => {
    renderCPLogin();

    const { passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: getTooShortPasswordValue(), // generated
    });

    expect(passwordElement).toBeInvalid();
    expect(
      screen.getByText('"password" length must be at least 8 characters long'),
    ).toBeInTheDocument();
  });

  it('check if entering the right email and password logs in as expected', async () => {
    axios.post.mockResolvedValue({
      statusText: 'OK',
      data: { token: '1234' },
    });

    renderCPLogin();

    const { emailElement, passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: getValidPasswordValue(), // generated
    });

    await waitFor(() => {
      expect(emailElement).not.toBeInvalid();
      expect(passwordElement).not.toBeInvalid();
    });

    await waitFor(() => {
      expect(history.push).toHaveBeenCalledWith('/communityportal');
    });
  });

  it("check if statusText is not 'OK' and status is 422 and displays validation error", async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 422,
      data: { token: '1234', label: 'email', message: 'User not found' },
    });

    renderCPLogin();

    fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: getValidPasswordValue(), // generated
    });

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it("check if statusText is not 'OK' and status is not 422 and does not display validation error", async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 500,
      data: { token: '1234' },
    });

    renderCPLogin();

    const { passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: getValidPasswordValue(), // generated
    });

    await waitFor(() => {
      expect(passwordElement).not.toBeInvalid();
    });
  });

  it('check failed post request does not display validation error', async () => {
    axios.post.mockRejectedValue({ response: 'server error' });

    renderCPLogin();

    const { passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: getValidPasswordValue(), // generated
    });

    await waitFor(() => {
      expect(passwordElement).not.toBeInvalid();
    });
  });
});
