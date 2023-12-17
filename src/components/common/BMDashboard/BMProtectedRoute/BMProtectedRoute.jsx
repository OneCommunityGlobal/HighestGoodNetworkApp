import React from "react"
import { Redirect, Route } from "react-router-dom"
import { connect } from 'react-redux'
import { Suspense } from "react"

const BMProtectedRoute = ({ component: Component, render, auth, fallback, ...rest }) => {
  return <Route
    {...rest}
    render={props => {
      if (!auth.isAuthenticated) {
        return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
      }
      else if (auth.user.access && !auth.user.access.canAccessBMPortal) {
        return <Redirect to={{ pathname: '/bmdashboard/login', state: { from: props.location } }} />
      }
      return (Component && fallback) ? <Suspense fallback={<div className="d-flex justify-content-center"><i className="fa fa-spinner fa-pulse" ></i></div>}> <Component {...props} />  </Suspense> : Component ? <Component {...props} /> : render(props);
    }}
  />
}

const mapStateToProps = state => ({
  auth: state.auth,
  // Note: roles props won't be used until permissions added to BM Dashboard
  roles: state.role.roles,
});

export default connect(mapStateToProps)(BMProtectedRoute)