import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Suspense } from 'react';

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
  const permissions = roles?.find(({ roleName }) => roleName === auth.user.role)?.permissions;
  const userPermissions = auth.user?.permissions?.frontPermissions;
  let hasPermissionToAccess = permissions?.some(perm => perm === routePermissions);

  if (Array.isArray(routePermissions)) {
    if (permissions?.some(perm => routePermissions.includes(perm))) {
      hasPermissionToAccess = true;
    }

    if (userPermissions?.some(perm => routePermissions.includes(perm))) {
      hasPermissionToAccess = true;
    }
  }

  if (userPermissions?.some(perm => perm === routePermissions)) {
    hasPermissionToAccess = true;
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
        return (Component && fallback) ? <Suspense fallback={<div className="d-flex justify-content-center"><i className="fa fa-spinner fa-pulse" /></div>}> <Component {...props} />  </Suspense> : Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
  roles: state.role.roles,
});

export default connect(mapStateToProps)(ProtectedRoute);
