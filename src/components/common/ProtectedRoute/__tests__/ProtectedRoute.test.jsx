import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';
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

const mockStore = configureMockStore([thunk]);

// Mock components for testing
// function LoginComponent() {
//   return <div>Login Page</div>;
// }
// function DashboardComponent() {
//   return <div>Dashboard Page</div>;
// }
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

  test('should redirect to login if user is not authenticated', () => {
    const { history } = renderWithRouter(
      <ProtectedRoute path="/protected" component={TargetComponent} />,
      { route: '/protected', store },
    );
    expect(history.location.pathname).toBe('/login');
  });

  test('authenticated user without required permissions should redirect to dashboard', () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'user', permissions: { frontPermissions: [] } },
      },
      role: { roles: [] },
    });

    const { history } = renderWithRouter(
      <ProtectedRoute
        path="/protected"
        component={TargetComponent}
        routePermissions={['SPECIAL_ACCESS']}
      />,
      { route: '/protected', store },
    );
    expect(history.location.pathname).toBe('/dashboard');
  });

  test('user with required role should access the protected route', () => {
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

    expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
  });

  test('user with required permissions through roles should access the protected route', () => {
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

    expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
  });

  test('user with required permissions through user permissions should access the protected route', () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'user', permissions: { frontPermissions: ['SPECIAL_ACCESS'] } },
      },
      role: { roles: [] },
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

    expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
  });

  test('proper rendering of the component when conditions are met', () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { role: 'user', permissions: { frontPermissions: ['SPECIAL_ACCESS'] } },
      },
      role: { roles: [] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute path="/protected" component={TargetComponent} />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
  });

  describe('PM Resource Dashboard permission denial UX', () => {
    const pmAllowedRoles = ['Administrator', 'Owner', 'Manager'];
    const pmRoutePermissions = ['accessPMResourceDashboard'];
    const pmDeniedState = {
      permissionDeniedMessage: 'You do not have access to the Resource Dashboard.',
    };

    const createAuthenticatedStore = (role, frontPermissions = []) =>
      mockStore({
        auth: {
          isAuthenticated: true,
          user: { role, permissions: { frontPermissions } },
        },
        role: { roles: [] },
      });

    const renderPMResourceDashboardRoute = testStore =>
      render(
        <Provider store={testStore}>
          <MemoryRouter initialEntries={['/pm/dashboard/resources']}>
            <ProtectedRoute
              path="/pm/dashboard/resources"
              component={TargetComponent}
              allowedRoles={pmAllowedRoles}
              routePermissions={pmRoutePermissions}
              permissionDeniedRedirectState={pmDeniedState}
            />
          </MemoryRouter>
        </Provider>,
      );

    const pmResourceDashboardRoute = (
      <ProtectedRoute
        path="/pm/dashboard/resources"
        component={TargetComponent}
        allowedRoles={pmAllowedRoles}
        routePermissions={pmRoutePermissions}
        permissionDeniedRedirectState={pmDeniedState}
      />
    );

    test.each(pmAllowedRoles)('%s can access without the dedicated PM permission', role => {
      store = createAuthenticatedStore(role);

      renderPMResourceDashboardRoute(store);

      expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
    });

    test('non-PM authenticated user with accessPMResourceDashboard can access', () => {
      store = createAuthenticatedStore('Volunteer', pmRoutePermissions);

      renderPMResourceDashboardRoute(store);

      expect(screen.getByText(/Target Page/i)).toBeInTheDocument();
    });

    test('non-PM authenticated user without accessPMResourceDashboard redirects with PM denial state', () => {
      store = createAuthenticatedStore('Volunteer');

      const { history } = renderWithRouter(pmResourceDashboardRoute, {
        route: '/pm/dashboard/resources',
        store,
      });

      expect(history.location.pathname).toBe('/dashboard');
      expect(history.location.state.permissionDeniedMessage).toBe(
        'You do not have access to the Resource Dashboard.',
      );
    });

    test('other protected route denials do not receive the PM denial state by default', () => {
      store = createAuthenticatedStore('Volunteer');

      const { history } = renderWithRouter(
        <ProtectedRoute
          path="/protected"
          component={TargetComponent}
          routePermissions={['SPECIAL_ACCESS']}
        />,
        { route: '/protected', store },
      );

      expect(history.location.pathname).toBe('/dashboard');
      expect(history.location.state.permissionDeniedMessage).toBeUndefined();
    });
  });
});
