/* eslint-disable */
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Suspense, Component } from 'react';

// Error Boundary for individual routes
class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '50vh' }}
        >
          <div className="text-center">
            <h4>Component failed to load</h4>
            <p>Please try refreshing the page or navigating back.</p>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component for Suspense fallback
const RouteLoading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
    <div className="text-center">
      <i className="fa fa-spinner fa-pulse fa-2x text-primary"></i>
      <p className="mt-2">Loading...</p>
    </div>
  </div>
);

// eslint-disable-next-line react/function-component-definition
const ProtectedRoute = ({
  component: Component,
  render,
  auth,
  roles,
  allowedRoles,
  routePermissions,
  fallback,
  ...rest
}) => {
  // Check if auth state is properly initialized
  if (!auth || typeof auth.isAuthenticated === 'undefined') {
    return (
      <Route
        {...rest}
        render={() => (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '50vh' }}
          >
            <div className="text-center">
              <i className="fa fa-spinner fa-pulse fa-2x text-primary"></i>
              <p className="mt-2">Initializing authentication...</p>
            </div>
          </div>
        )}
      />
    );
  }

  // Check if we have a token but auth is still initializing
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token && !auth.isAuthenticated) {
    return (
      <Route
        {...rest}
        render={() => (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '50vh' }}
          >
            <div className="text-center">
              <i className="fa fa-spinner fa-pulse fa-2x text-primary"></i>
              <p className="mt-2">Verifying authentication...</p>
            </div>
          </div>
        )}
      />
    );
  }

  const rolePermissions =
    roles?.find(({ roleName }) => roleName === auth.user.role)?.permissions || [];
  const userPermissions = auth.user?.permissions?.frontPermissions || [];
  const permissionsAllowed = new Set([...rolePermissions, ...userPermissions]);
  let hasPermissionToAccess = routePermissions?.some(perm => permissionsAllowed.has(perm));

  if (Array.isArray(routePermissions)) {
    if (rolePermissions?.some(perm => routePermissions.includes(perm))) {
      hasPermissionToAccess = true;
    }

    if (userPermissions?.some(perm => routePermissions.includes(perm))) {
      hasPermissionToAccess = true;
    }
  }

  if (allowedRoles?.some(allowRole => allowRole === auth?.user?.role)) {
    hasPermissionToAccess = true;
  }

  return (
    <Route
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      render={props => {
        if (!auth.isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
        if (routePermissions && !hasPermissionToAccess) {
          return <Redirect to={{ pathname: '/dashboard', state: { from: props.location } }} />;
        }

        // eslint-disable-next-line react/jsx-props-no-spreading, no-nested-ternary
        return Component && fallback ? (
          <RouteErrorBoundary>
            <Suspense fallback={<RouteLoading />}>
              <Component {...props} />
            </Suspense>
          </RouteErrorBoundary>
        ) : Component ? (
          <RouteErrorBoundary>
            <Component {...props} />
          </RouteErrorBoundary>
        ) : (
          render(props)
        );
      }}
    />
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
  roles: state.role.roles,
});

export default connect(mapStateToProps)(ProtectedRoute);
