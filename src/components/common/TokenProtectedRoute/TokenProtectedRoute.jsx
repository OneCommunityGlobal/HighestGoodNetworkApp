import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const TokenProtectedRoute = ({ component: Component, ...rest }) => {
  const isTokenValid = token => {
    return token === '1992-10';
  };

  return (
    <Route
      {...rest}
      render={props => {
        const token = props.match.params.token;

        if (isTokenValid(token)) {
          return <div>hello</div>;
        } else {
          return <div>Invalid Link</div>;
        }
      }}
    />
  );
};

export default TokenProtectedRoute;
