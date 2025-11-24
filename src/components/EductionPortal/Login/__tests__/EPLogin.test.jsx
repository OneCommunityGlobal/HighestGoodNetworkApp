import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import EPLogin from '../EPLogin';

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

vi.mock('axios');

vi.mock('jwt-decode', () => ({
  default: vi.fn(() => ({ decodedPayload: 'mocked_decoded_payload' })),
}));
const history = {
  push: vi.fn(),
  location: { pathname: '/' },
};

const renderComponent = testStore => {
  function LoginWrapper() {
    const dispatch = useDispatch();
    const location = {};

    return <EPLogin dispatch={dispatch} history={history} location={location} />;
  }
  return render(
    <Provider store={testStore}>
      <Router>
        <LoginWrapper />
      </Router>
    </Provider>,
  );
};

describe('EPLogin component', () => {
  it('renders without crashing', () => {
    renderComponent(store);
  });
  it('check if login elements get displayed when isAuthenticated is true', () => {
    renderComponent(store);
    expect(screen.getByText('Log In To Good Education Portal')).toBeInTheDocument();
  });
  it('check if login elements does not get displayed when isAuthenticated is false', () => {
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
    expect(screen.queryByText('Log In To Good Education Portal')).not.toBeInTheDocument();
  });
  it('check if Enter your current user credentials to access the Building Management Dashboard header displays as expected', () => {
    renderComponent(store);
    expect(
      screen.getByText('Enter your current user credentials to access the Good Education Portal'),
    ).toBeInTheDocument();
  });
  it('check if Note: You must use your Production/Main credentials for this login. header displays as expected', () => {
    renderComponent(store);
    expect(
      screen.getByText('Note: You must use your Production/Main credentials for this login.'),
    ).toBeInTheDocument();
  });
  it('check if email label is displaying as expected', () => {
    renderComponent(store);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
  it('check if password label is displaying as expected', () => {
    renderComponent(store);
    expect(screen.getByText('Password')).toBeInTheDocument();
  });
  it('check if submit button is disabled when either email or password is not entered', () => {
    renderComponent(store);
    const buttonElement = screen.getByText('Submit');
    expect(buttonElement).toBeDisabled();
  });
  it('check if validation for invalid email id works as expected', () => {
    const { container } = renderComponent(store);
    const emailElement = screen.getByLabelText(/email/i);
    fireEvent.change(emailElement, { target: { value: 'test' } });

    const passwordElement = screen.getByLabelText(/password/i);
    fireEvent.change(passwordElement, { target: { value: '12' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    expect(emailElement).toBeInvalid();
    expect(screen.getByText('"email" must be a valid email')).toBeInTheDocument();
  });
  it('check if validation for password works as expected', () => {
    const { container } = renderComponent(store);
    const emailElement = screen.getByLabelText(/email/i);
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = screen.getByLabelText(/password/i);
    fireEvent.change(passwordElement, { target: { value: '12' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

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

    const { container } = renderComponent(store);

    const emailElement = screen.getByLabelText(/email/i);
    const passwordElement = screen.getByLabelText(/password/i);
    const submitElement = screen.getByText('Submit');

    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });
    fireEvent.change(passwordElement, { target: { value: 'Test12345' } });
    fireEvent.click(submitElement);

    await waitFor(() => {
      expect(emailElement).not.toBeInvalid();
    });
    expect(passwordElement).not.toBeInvalid();
    expect(screen.queryByText('"email" must be a valid email')).not.toBeInTheDocument();
    expect(
      screen.queryByText('"password" length must be at least 8 characters long'),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(history.push).toHaveBeenCalledWith('/educationportal');
    });
  });
  it("check if statusText in response is not 'OK' and status is 422 and displays validation error", async () => {
    axios.post.mockResolvedValue({
      statusText: 'ERROR',
      status: 422,
      data: { token: '1234', label: 'email', message: 'User not found' },
    });
    const { container } = renderComponent(store);

    const emailElement = screen.getByLabelText(/email/i);
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = screen.getByLabelText(/password/i);
    fireEvent.change(passwordElement, { target: { value: 'Test12345' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

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
    const { container } = renderComponent(store);

    const emailElement = screen.getByLabelText(/email/i);
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = screen.getByLabelText(/password/i);
    fireEvent.change(passwordElement, { target: { value: 'Test12345' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    await waitFor(() => {
      expect(passwordElement).not.toBeInvalid();
    });
  });
  it('check failed post request does not display any validation error', async () => {
    axios.post.mockRejectedValue({ response: 'server error' });
    const { container } = renderComponent(store);

    const emailElement = screen.getByLabelText(/email/i);
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = screen.getByLabelText(/password/i);
    fireEvent.change(passwordElement, { target: { value: 'Test12345' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    await waitFor(() => {
      expect(passwordElement).not.toBeInvalid();
    });
  });
});
