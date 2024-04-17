import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BMLogin from '..';
import { useDispatch, Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { useHistory } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

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

const renderComponent = testStore => {
  function LoginWrapper() {
    const dispatch = useDispatch();
    const history = useHistory();
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
  it('check if login elements get displayed when isAuthenticated is true', () => {
    renderComponent(store);
    expect(screen.getByText('Log In To Building Management Dashboard')).toBeInTheDocument();
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
    expect(screen.queryByText('Log In To Building Management Dashboard')).not.toBeInTheDocument();
  });
  it('check if Enter your current user credentials to access the Building Management Dashboard header displays as expected', () => {
    renderComponent(store);
    expect(
      screen.getByText(
        'Enter your current user credentials to access the Building Management Dashboard',
      ),
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
  it('check if validation works for invalid email id', async () => {
    const { container } = renderComponent(store);
    const emailElement = container.querySelector('[name="email"]');
    fireEvent.change(emailElement, { target: { value: 'test' } });

    const submitElement = screen.getByText('Submit');
    fireEvent.click(submitElement);

    const updatedEmailElement = container.querySelector('[name="email"]');
    expect(updatedEmailElement).toBeInvalid();
  });
});
