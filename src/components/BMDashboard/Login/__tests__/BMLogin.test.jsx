import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import BMLogin from '../BMLogin';
import { act } from 'react-dom/test-utils';
const mockLoginBMUser = vi.fn();

vi.mock('~/actions/authActions', () => ({
  loginBMUser: (...args) => mockLoginBMUser(...args),
}));

vi.mock('jwt-decode', () => ({
  default: vi.fn(() => ({ decodedPayload: 'mocked_decoded_payload' })),
}));

const mockStore = configureStore([thunk]);
let store;

const TEST_PASSWORD = 'test-password'; // NOSONAR - test-only credential
const SHORT_PASSWORD = '12'; // NOSONAR - test-only invalid password

beforeEach(() => {
  store = mockStore({
    auth: {
      isAuthenticated: true,
      user: {
        access: {
          canAccessBMPortal: true,
        },
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
});

const history = {
  push: vi.fn(),
  location: { pathname: '/' },
};

const renderComponent = testStore => {
  function LoginWrapper() {
    const dispatch = useDispatch();
    const location = {};
    return <BMLogin dispatch={dispatch} history={history} location={location} />;
  }

  return render(
    <Provider store={testStore}>
      <Router>
        <LoginWrapper />
      </Router>
    </Provider>,
  );
};

const fillAndSubmit = ({ email = 'test@gmail.com', password = TEST_PASSWORD } = {}) => {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
  fireEvent.click(screen.getByText('Submit'));
};

describe('BMLogin component', () => {
  it('renders without crashing', () => {
    renderComponent(store);
  });

  it('shows login header when authenticated', () => {
    renderComponent(store);
    expect(screen.getByText('Log In To Building Management Dashboard')).toBeInTheDocument();
  });

  it('does not show login header when not authenticated', () => {
    const testStore = mockStore({
      auth: {
        isAuthenticated: false,
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

    renderComponent(testStore);
    expect(screen.queryByText('Log In To Building Management Dashboard')).not.toBeInTheDocument();
  });

  it('renders subheaders', () => {
    renderComponent(store);
    expect(
      screen.getByText(
        'Enter your current user credentials to access the Building Management Dashboard',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Note: You must use your Production/Main credentials for this login.'),
    ).toBeInTheDocument();
  });

  it('renders email and password labels', () => {
    renderComponent(store);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('disables submit button with missing credentials', () => {
    renderComponent(store);
    expect(screen.getByText('Submit')).toBeDisabled();
  });

  it('shows validation error for invalid email', () => {
    renderComponent(store);
    fillAndSubmit({ email: 'test', password: SHORT_PASSWORD });

    expect(screen.getByLabelText(/email/i)).toBeInvalid();
    expect(screen.getByText('"email" must be a valid email')).toBeInTheDocument();
  });

  it('shows validation error for short password', () => {
    renderComponent(store);
    fillAndSubmit({ password: SHORT_PASSWORD });

    expect(screen.getByLabelText(/password/i)).toBeInvalid();
    expect(
      screen.getByText('"password" length must be at least 8 characters long'),
    ).toBeInTheDocument();
  });

  it('logs in successfully with correct credentials', async () => {
    mockLoginBMUser.mockImplementationOnce(() => async () => ({
      statusText: 'OK',
      data: { token: '1234' },
    }));

    renderComponent(store);
    fillAndSubmit();

    await waitFor(() => {
      expect(history.push).toHaveBeenCalledWith('/bmdashboard');
    });
  });

  it('displays specific validation error for status 422', async () => {
    mockLoginBMUser.mockImplementationOnce(() => async () => ({
      statusText: 'ERROR',
      status: 422,
      data: { label: 'email', message: 'User not found' },
    }));

    renderComponent(store);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('does not show error if status is not 422', async () => {
    mockLoginBMUser.mockImplementationOnce(() => async () => ({
      statusText: 'ERROR',
      status: 500,
      data: {},
    }));

    renderComponent(store);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  it('handles post rejection without validation error', async () => {
    mockLoginBMUser.mockImplementationOnce(() => async () => ({
      statusText: 'ERROR',
      status: 500,
      data: {},
    }));

    renderComponent(store);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });
});
