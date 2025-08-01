// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import LBLogin from '..';

const mockStore = configureStore([thunk]);
let store;

beforeEach(() => {
  store = mockStore({
    auth: {
      isAuthenticated: true,
      user: {
        access: { canAccessCPPortal: true },
      },
    },
  });
});

vi.mock('axios');

const history = {
  push: vi.fn(),
  location: { pathname: '/' },
};

const renderComponent = testStore => {
  function LoginWrapper() {
    const dispatch = useDispatch();
    const location = {};
    return <LBLogin dispatch={dispatch} history={history} location={location} />;
  }
  return render(
    <Provider store={testStore}>
      <Router>
        <LoginWrapper />
      </Router>
    </Provider>,
  );
};

describe('LBLogin component', () => {
  it('renders without crashing', () => {
    renderComponent(store);
  });

  it('displays login elements when isAuthenticated is true', () => {
    renderComponent(store);
    expect(screen.getByText('Log In To Listing and Biding Portal')).toBeInTheDocument();
  });

  it('displays email and password labels', () => {
    renderComponent(store);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('disables submit button when email or password is empty', () => {
    renderComponent(store);
    const buttonElement = screen.getByText('Login');
    expect(buttonElement).toBeDisabled();
  });

  it('handles failed post request without validation message', async () => {
    axios.post.mockRejectedValue({ response: 'server error' });
    const { container } = renderComponent(store);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@gmail.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Test12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      const feedback = screen.queryByText(/invalid/i);
      expect(feedback).not.toBeInTheDocument();
    });
  });
});
