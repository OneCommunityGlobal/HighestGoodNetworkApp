/* eslint-disable react/jsx-props-no-spreading */
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Suspense } from 'react';

// eslint-disable-next-line react/function-component-definition
const CPProtectedRoute = ({ component: Component, render, auth, fallback, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
        if (auth.user.access && !auth.user.access.canAccessBMPortal) {
          return (
            <Redirect to={{ pathname: '/communityportal/login', state: { from: props.location } }} />
          );
        }
        // eslint-disable-next-line no-nested-ternary
        return Component && fallback ? (
          <Suspense
            fallback={
              <div className="d-flex justify-content-center">
                <i className="fa fa-spinner fa-pulse" />
              </div>
            }
          >
            {' '}
            <Component {...props} />{' '}
          </Suspense>
        ) : Component ? (
          <Component {...props} />
        ) : (
          render(props)
        );
      }}
    />
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
  // Note: roles props won't be used until permissions added to BM Dashboard
  roles: state.role.roles,
});

export default connect(mapStateToProps)(CPProtectedRoute);
