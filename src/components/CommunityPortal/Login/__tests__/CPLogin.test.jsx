import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import CPLogin from '../CPLogin';

vi.mock('axios');

vi.mock('jwt-decode', () => ({
  default: vi.fn(() => ({ decodedPayload: 'mocked_decoded_payload' })),
}));

const mockStore = configureStore([thunk]);

// Avoid password-like literals (Sonar hotspot). Keep it obviously fake.
const DUMMY_PASSWORD = 'not_a_real_password_for_test_only';
const VALID_EMAIL = 'test@gmail.com';

const history = {
  push: vi.fn(),
  location: { pathname: '/' },
};

const makeStore = (isAuthenticated = true) =>
  mockStore({
    auth: {
      isAuthenticated,
      user: {
        permissions: {
          frontPermissions: [],
          backPermissions: [],
        },
        role: 'Owner',
      },
      permissions: {
        frontPermissions: [],
        backPermissions: [],
      },
    },
  });

const renderCPLogin = store => {
  function LoginWrapper() {
    const dispatch = useDispatch();
    const location = {};
    return <CPLogin dispatch={dispatch} history={history} location={location} />;
  }

  return render(
    <Provider store={store}>
      <Router>
        <LoginWrapper />
      </Router>
    </Provider>,
  );
};

const fillAndSubmit = ({ emailValue = '', passwordValue = '' } = {}) => {
  const emailElement = screen.getByRole('textbox', { name: /email/i });
  const passwordElement = screen.getByLabelText(/password/i);
  const submitElement = screen.getByText('Submit');

  if (emailValue !== '') {
    fireEvent.change(emailElement, { target: { value: emailValue } });
  }
  if (passwordValue !== '') {
    fireEvent.change(passwordElement, { target: { value: passwordValue } });
  }

  fireEvent.click(submitElement);
  return { emailElement, passwordElement, submitElement };
};

describe('CPLogin component', () => {
  let store;

  beforeEach(() => {
    store = makeStore(true);
    history.push.mockClear();
    axios.post?.mockReset?.();
  });

  it('renders without crashing', () => {
    renderCPLogin(store);
  });

  it('check if login elements get displayed when isAuthenticated is true', () => {
    renderCPLogin(store);
    expect(screen.getByText('Log In To Community Portal')).toBeInTheDocument();
  });

  it('check if login elements does not get displayed when isAuthenticated is false', () => {
    const unauthStore = makeStore(false);
    renderCPLogin(unauthStore);
    expect(screen.queryByText('Log In To Community Portal')).not.toBeInTheDocument();
  });

  it('check if Enter your current user credentials to access the Building Management Dashboard header displays as expected', () => {
    renderCPLogin(store);
    expect(
      screen.getByText(
        'Enter your current user credentials to access the Community Portal Dashboard',
      ),
    ).toBeInTheDocument();
  });

  it('check if Note: You must use your Production/Main credentials for this login. header displays as expected', () => {
    renderCPLogin(store);
    expect(
      screen.getByText('Note: You must use your Production/Main credentials for this login.'),
    ).toBeInTheDocument();
  });

  it('check if email label is displaying as expected', () => {
    renderCPLogin(store);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('check if password label is displaying as expected', () => {
    renderCPLogin(store);
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('check if submit button is disabled when either email or password is not entered', () => {
    renderCPLogin(store);
    const buttonElement = screen.getByText('Submit');
    expect(buttonElement).toBeDisabled();
  });

  it('check if validation for invalid email id works as expected', () => {
    renderCPLogin(store);

    const { emailElement } = fillAndSubmit({
      emailValue: 'test',
      passwordValue: 'short', // not password-like, just a short string to fail validation
    });

    expect(emailElement).toBeInvalid();
    expect(screen.getByText('"email" must be a valid email')).toBeInTheDocument();
  });

  it('check if validation for password works as expected', () => {
    renderCPLogin(store);

    const { passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: 'short', // triggers min length validation
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

    renderCPLogin(store);

    const { emailElement, passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: DUMMY_PASSWORD,
    });

    await waitFor(() => {
      expect(emailElement).not.toBeInvalid();
      expect(passwordElement).not.toBeInvalid();
    });

    expect(screen.queryByText('"email" must be a valid email')).not.toBeInTheDocument();
    expect(
      screen.queryByText('"password" length must be at least 8 characters long'),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(history.push).toHaveBeenCalledWith('/communityportal');
    });
  });

  it("check if statusText in response is not 'OK' and status is 422 and displays validation error", async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 422,
      data: { token: '1234', label: 'email', message: 'User not found' },
    });

    renderCPLogin(store);

    fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: DUMMY_PASSWORD,
    });

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it("check if statusText in response is not 'OK' and status is not 422 and does not display any validation error", async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 500,
      data: { token: '1234' },
    });

    renderCPLogin(store);

    const { passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: DUMMY_PASSWORD,
    });

    await waitFor(() => {
      expect(passwordElement).not.toBeInvalid();
    });
  });

  it('check failed post request does not display any validation error', async () => {
    axios.post.mockRejectedValue({ response: 'server error' });

    renderCPLogin(store);

    const { passwordElement } = fillAndSubmit({
      emailValue: VALID_EMAIL,
      passwordValue: DUMMY_PASSWORD,
    });

    await waitFor(() => {
      expect(passwordElement).not.toBeInvalid();
    });
  });
});
