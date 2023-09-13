import React from "react"
import { Redirect, Route } from "react-router-dom"
import { connect } from 'react-redux'

const ProtectedBMRoute = ({ component: Component, render, auth, ...rest}) => {
return <Route
        {...rest}
        render={props => {
          if (!auth.isAuthenticated) {
            return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
          }
          else if (!auth.isBMAuthenticated) {
            return <Redirect to={{ pathname: '/bmdashboard/login', state: { from: props.location } }} />
          }
          return Component ? <Component {...props} /> : render(props);
        }}
      />
    }

const mapStateToProps = state => ({
  auth: state.auth,
  roles: state.role.roles,
});

export default connect(mapStateToProps)(ProtectedBMRoute)