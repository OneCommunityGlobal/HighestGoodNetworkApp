// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

// Custom render function that includes access to the history object
const renderWithRouter = (
  ui,
  { route = '/', history = createMemoryHistory({ initialEntries: [route] }), store } = {},
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <Router history={history}>{children}</Router>
      </Provider>
    );
  }
  return {
    ...render(ui, { wrapper: Wrapper }),
    history,
  };
};

const mockStore = configureStore([thunk]);

// Mock components for testing
// eslint-disable-next-line no-unused-vars
function LoginComponent() {
  return <div>Login Page</div>;
}
// eslint-disable-next-line no-unused-vars
function DashboardComponent() {
  return <div>Dashboard Page</div>;
}
function TargetComponent() {
  return <div>Target Page</div>;
}

describe('ProtectedRoute Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: { isAuthenticated: false, user: { role: '', permissions: { frontPermissions: [] } } },
      role: { roles: [] },
    });
  });

  test('should redirect to login if user is not authenticated', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: false,
        user: { role: 'guest', permissions: { frontPermissions: [] } },
      },
      role: {
        roles: [{ roleName: 'guest', permissions: [] }],
      },
    });

    const { history } = renderWithRouter(
      <ProtectedRoute path="/protected" component={TargetComponent} />,
      { route: '/protected', store },
    );

    await waitFor(() => {
      expect(history.location.pathname).toBe('/login');
    });
  });

  test('authenticated user without required permissions should redirect to dashboard', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'user', permissions: { frontPermissions: [] } },
      },
      role: { roles: [{ roleName: 'guest', permissions: [] }] },
    });

    const { history } = renderWithRouter(
      <ProtectedRoute
        path="/protected"
        component={TargetComponent}
        routePermissions={['SPECIAL_ACCESS']}
      />,
      { route: '/protected', store },
    );

    await waitFor(() => {
      expect(history.location.pathname).toBe('/dashboard');
    });
  });

  test('user with required role should access the protected route', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'admin', permissions: { frontPermissions: [] } },
      },
      role: { roles: [{ roleName: 'admin', permissions: ['SPECIAL_ACCESS'] }] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute path="/protected" component={TargetComponent} allowedRoles={['admin']} />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
    });
  });

  test('user with required permissions through roles should access the protected route', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'admin', permissions: { frontPermissions: [] } },
      },
      role: { roles: [{ roleName: 'admin', permissions: ['SPECIAL_ACCESS'] }] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute
            path="/protected"
            component={TargetComponent}
            routePermissions={['SPECIAL_ACCESS']}
          />
        </MemoryRouter>
      </Provider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
    });
  });

  test('user with required permissions through user permissions should access the protected route', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'user', permissions: { frontPermissions: ['SPECIAL_ACCESS'] } },
      },
      role: { roles: [{ roleName: 'user', permissions: [] }] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute
            path="/protected"
            component={TargetComponent}
            routePermissions={['SPECIAL_ACCESS']}
          />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
    });
  });

  test('proper rendering of the component when conditions are met', async () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'user', permissions: { frontPermissions: ['SPECIAL_ACCESS'] } },
      },
      role: { roles: [{ roleName: 'user', permissions: [] }] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute path="/protected" component={TargetComponent} />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
    });
  });
});
