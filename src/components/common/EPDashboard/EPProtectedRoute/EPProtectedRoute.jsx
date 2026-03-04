/* eslint-disable react/jsx-props-no-spreading */
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { Suspense } from 'react';
import EducationPortalLayout from '~/components/EductionPortal/layout/EducationPortalLayout';

// eslint-disable-next-line react/function-component-definition
const EPProtectedRoute = ({ component: Component, render, auth, fallback, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }

        // If the user explicitly logged out of the Education Portal, require EP login again.
        const epLoggedOut =
          typeof window !== 'undefined' && window.sessionStorage
            ? window.sessionStorage.getItem('gePortalLoggedOut') === 'true'
            : false;
        if (epLoggedOut) {
          return (
            <Redirect
              to={{ pathname: '/educationportal/login', state: { from: props.location } }}
            />
          );
        }

        // Only enforce portal access check once access flags are available.
        // Some environments expose EP access as `canAccessGEPortal`, others as `canAccessBMPortal`.
        if (auth.user.access) {
          const access = auth.user.access;
          const hasGEFlag = Object.prototype.hasOwnProperty.call(access, 'canAccessGEPortal');
          const canAccessEP = hasGEFlag ? access.canAccessGEPortal : access.canAccessBMPortal;

          if (!canAccessEP) {
            return (
              <Redirect
                to={{ pathname: '/educationportal/login', state: { from: props.location } }}
              />
            );
          }
        }

        const Page = Component ? <Component {...props} /> : render(props);
        const Wrapped = <EducationPortalLayout>{Page}</EducationPortalLayout>;

        // eslint-disable-next-line no-nested-ternary
        return fallback ? (
          <Suspense
            fallback={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <div className="d-flex justify-content-center">
                <i className="fa fa-spinner fa-pulse" />
              </div>
            }
          >
            {Wrapped}
          </Suspense>
        ) : (
          Wrapped
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

export default connect(mapStateToProps)(EPProtectedRoute);
