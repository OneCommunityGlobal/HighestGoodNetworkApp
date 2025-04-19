import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CPLogin from '..';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

const mockStore = configureStore([thunk]);
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

jest.mock('axios');

jest.mock('jwt-decode', () => jest.fn(token => ({ decodedPayload: 'mocked_decoded_payload' })));

const history = {
  push: jest.fn(),
  location: { pathname: '/' },
};

const renderComponent = testStore => {
  function LoginWrapper() {
    const dispatch = useDispatch();
    const location = {};

    return <CPLogin dispatch={dispatch} history={history} location={location} />;
  }
  return render(
    <Provider store={testStore}>
      <Router>
        <LoginWrapper />
      </Router>
    </Provider>,
  );
};

describe('CPLogin component', () => {
  it('renders without crashing', () => {
    renderComponent(store);
  });
  it('check if login elements get displayed when isAuthenticated is true', () => {
    renderComponent(store);
    expect(screen.getByText('Log In To Community Portal')).toBeInTheDocument();
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
    expect(screen.queryByText('Log In To Community Portal')).not.toBeInTheDocument();
  });
  it('check if Enter your current user credentials to access the Building Management Dashboard header displays as expected', () => {
    renderComponent(store);
    expect(
      screen.getByText(
        'Enter your current user credentials to access the Community Portal Dashboard',
      ),
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
    const emailElement = container.querySelector('[name="email"]');
    fireEvent.change(emailElement, { target: { value: 'test' } });

    const passwordElement = container.querySelector('[name="password"]');
    fireEvent.change(passwordElement, { target: { value: '12' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    expect(emailElement).toBeInvalid();
    expect(screen.getByText('"email" must be a valid email')).toBeInTheDocument();
  });
  it('check if validation for password works as expected', () => {
    const { container } = renderComponent(store);
    const emailElement = container.querySelector('[name="email"]');
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = container.querySelector('[name="password"]');
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

    const emailElement = container.querySelector('[name="email"]');
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = container.querySelector('[name="password"]');
    fireEvent.change(passwordElement, { target: { value: 'Test12345' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    expect(screen.queryByText('"email" must be a valid email')).not.toBeInTheDocument();
    expect(
      screen.queryByText('"password" length must be at least 8 characters long'),
    ).not.toBeInTheDocument();
    expect(emailElement).not.toBeInvalid();
    expect(passwordElement).not.toBeInvalid();
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
    const { container } = renderComponent(store);

    const emailElement = container.querySelector('[name="email"]');
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = container.querySelector('[name="password"]');
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

    const emailElement = container.querySelector('[name="email"]');
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = container.querySelector('[name="password"]');
    fireEvent.change(passwordElement, { target: { value: 'Test12345' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    await waitFor(() => {
      const messageElement = container.querySelector('.invalid-feedback');
      expect(messageElement).not.toBeInTheDocument();
    });
  });
  it('check failed post request does not display any validation error', async () => {
    axios.post.mockRejectedValue({ response: 'server error' });
    const { container } = renderComponent(store);

    const emailElement = container.querySelector('[name="email"]');
    fireEvent.change(emailElement, { target: { value: 'test@gmail.com' } });

    const passwordElement = container.querySelector('[name="password"]');
    fireEvent.change(passwordElement, { target: { value: 'Test12345' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    await waitFor(() => {
      const messageElement = container.querySelector('.invalid-feedback');
      expect(messageElement).not.toBeInTheDocument();
    });
  });
});
