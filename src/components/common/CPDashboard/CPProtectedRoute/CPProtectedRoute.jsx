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
        // Check if auth state is properly initialized
        if (!auth || typeof auth.isAuthenticated === 'undefined') {
          return (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: '50vh' }}
            >
              <div className="text-center">
                <i className="fa fa-spinner fa-pulse fa-2x text-primary"></i>
                <p className="mt-2">Initializing authentication...</p>
              </div>
            </div>
          );
        }

        // Check if we have a token but auth is still initializing
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token && !auth.isAuthenticated) {
          return (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: '50vh' }}
            >
              <div className="text-center">
                <i className="fa fa-spinner fa-pulse fa-2x text-primary"></i>
                <p className="mt-2">Verifying authentication...</p>
              </div>
            </div>
          );
        }

        if (!auth.isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
        if (auth.user.access && !auth.user.access.canAccessBMPortal) {
          return (
            <Redirect
              to={{ pathname: '/communityportal/login', state: { from: props.location } }}
            />
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
