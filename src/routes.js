import React from 'react'
import Timelog from './components/Timelog'
import Reports from './components/Reports'
import UserProfile from './components/UserProfile'
import { Route, Switch } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import { Logout } from './components/Logout'
import Login from './components/Login'
import ForcePasswordUpdate from './components/ForcePasswordUpdate'
import ProtectedRoute from './components/common/ProtectedRoute'
import UpdatePassword from './components/UpdatePassword'
import Header from './components/Header'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default (
  <React.Fragment>
    <Header />
    <ToastContainer />
    <Switch>
      <ProtectedRoute path='/dashboard' exact component={Dashboard} />
      <ProtectedRoute path='/timelog/:userId' exact component={Timelog} />
      <ProtectedRoute path='/Reports' exact component={Reports} />
      <Route path='/login' component={Login} />
      <ProtectedRoute path='/dashboard' exact component={Dashboard} />
      <ProtectedRoute path='/timelog/:userId' exact component={Timelog} />
      <ProtectedRoute path='/reports' exact component={Reports} />
      <ProtectedRoute path='/userprofile/:userId' component={UserProfile} />
      <ProtectedRoute
        path='/updatepassword/:userId'
        component={UpdatePassword}
      />
      <Route path='/Logout' component={Logout} />
      <Route
        path='/forcePasswordUpdate/:userId'
        component={ForcePasswordUpdate}
      />
      <ProtectedRoute path='/' exact component={Dashboard} />
    </Switch>
  </React.Fragment>
)
