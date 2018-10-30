import React from "react";
import { getCurrentUser } from "../../services/loginService";
import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({ component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (!getCurrentUser()) return <Redirect to={{pathname:"/login", 
        state : { from: props.location }}} />;
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default PrivateRoute;