import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';
import { connect } from "react-redux";
import { getCurrentUser } from "../actions";
import { getjwt } from "../services/loginService"; 
import Dashboard from './Dashboard'
import {Logout} from './Logout';
import Login from './Login'
import Header from './Header'
import Timelog from './Timelog';
import Reports from './Reports';
import Profile from './Profile'
import ForcePasswordUpdate from './ForcePasswordUpdate';
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './common/ProtectedRoute'

import logger from "../services/logService"

import '../App.css';

class App extends Component {

  componentDidMount() {
    this.props.getCurrentUser(getjwt())
  }

  componentDidCatch(error, errorInfo) {
   logger.logError(error)
  }
  
  render() {
    {console.log(this.props)}
    return (
      <React.Fragment>
      <Header/>
      <ToastContainer/>
      <Switch>
      <ProtectedRoute path="/dashboard" exact component={Dashboard} />
      <ProtectedRoute path="/timelog/:userId" exact component={Timelog} />
      <ProtectedRoute path="/Reports" exact component={Reports} />      
      <Route path="/login" component={Login} />
      <ProtectedRoute path="/profile/:userId" component={Profile} />
      <Route path="/Logout" component={Logout} />
      <Route path = "/forcePasswordUpdate/:userId" component = {ForcePasswordUpdate}/>
      <ProtectedRoute path = "/" exact component = {Dashboard}/>

      </Switch>

    </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return { state }
}


export default connect(
  mapStateToProps, 
  { getCurrentUser }
)(App);
