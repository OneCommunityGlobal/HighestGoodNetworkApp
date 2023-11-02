/* eslint-disable react/jsx-props-no-spreading */
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';

function BMProtectedRoute({ component: Component, render, auth, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.isAuthenticated) {
          return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
        }
        if (auth.user.access && !auth.user.access.canAccessBMPortal) {
          return (
            <Redirect to={{ pathname: '/bmdashboard/login', state: { from: props.location } }} />
          );
        }
        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  // Note: roles props won't be used until permissions added to BM Dashboard
  roles: state.role.roles,
});

export default connect(mapStateToProps)(BMProtectedRoute);
