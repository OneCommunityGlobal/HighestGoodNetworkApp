import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const TokenProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => (
        <React.Fragment>
          <Component {...props} />
        </React.Fragment>
      )}
    />
  );
};

export default TokenProtectedRoute;
