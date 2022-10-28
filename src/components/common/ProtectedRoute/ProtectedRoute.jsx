import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';

const ProtectedRoute = ({
  component: Component,
  render,
  auth,
  roles,
  routePermissions,
  ...rest
}) => {
  const permissions = roles.find(({ roleName }) => roleName === auth.user.role).permissions;
  const hasPermissionToAcess = permissions.some(perm => perm === routePermissions);

  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        } else if (routePermissions && !hasPermissionToAcess) {
          return <Redirect to={{ pathname: '/dashboard', state: { from: props.location } }} />;
        }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
  roles: state.role.roles,
});

export default connect(mapStateToProps)(ProtectedRoute);
