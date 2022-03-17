import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';

const ProtectedRoute = ({ component: Component, render, auth, ...rest }) => {
  let allowedRoles = rest.allowedRoles;
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!auth.isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        } else if (allowedRoles && allowedRoles.indexOf(auth.user.role) < 0) {
          return <Redirect to={{ pathname: '/dashboard', state: { from: props.location } }} />;
        }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(ProtectedRoute);
