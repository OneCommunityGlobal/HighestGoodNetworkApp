import React from "react";
import { Redirect, Route } from "react-router-dom";
import { connect } from "react-redux";
import { ADMIN_ROLE } from "../../../utils/constants";

const ProtectedRoute = ({ component: Component, render, auth, ...rest }) => {
  let adminroute = rest.adminroute;
  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.isAuthenticated) {
          return (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          );
        } else if (adminroute === true && auth.user.role !== ADMIN_ROLE) {
          return (
            <Redirect
              to={{ pathname: "/dashboard", state: { from: props.location } }}
            />
          );
        }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(ProtectedRoute);
