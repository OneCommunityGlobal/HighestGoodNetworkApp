import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import BMLogin from '../BMLogin';
import { act } from 'react-dom/test-utils';

vi.mock('axios');

vi.mock('jwt-decode', () => ({
  default: vi.fn(() => ({ decodedPayload: 'mocked_decoded_payload' })),
}));

const mockStore = configureMockStore([thunk]);
let store;

beforeEach(() => {
  store = mockStore({
    auth: {
      isAuthenticated: true,
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
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '12' } });
    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByLabelText(/email/i)).toBeInvalid();
    expect(screen.getByText('"email" must be a valid email')).toBeInTheDocument();
  });

  it('shows validation error for short password', () => {
    renderComponent(store);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '12' } });
    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByLabelText(/password/i)).toBeInvalid();
    expect(
      screen.getByText('"password" length must be at least 8 characters long'),
    ).toBeInTheDocument();
  });

  it('logs in successfully with correct credentials', async () => {
    axios.post.mockResolvedValue({
      statusText: 'OK',
      data: { token: '1234' },
    });

    renderComponent(store);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Test12345' } });
    fireEvent.click(screen.getByText('Submit'));

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });
    expect(history.push).toHaveBeenCalledWith('/bmdashboard'); // if you're using `useNavigate` from React Router v6+
  });

  it('displays specific validation error for status 422', async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 422,
      data: { token: '1234', label: 'email', message: 'User not found' },
    });

    renderComponent(store);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Test12345' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('does not show error if status is not 422', async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 500,
      data: { token: '1234' },
    });

    renderComponent(store);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Test12345' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  it('handles post rejection without validation error', async () => {
    axios.post.mockRejectedValue({ response: 'server error' });

    renderComponent(store);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Test12345' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });
});
