import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';
import Dashboard from './Dashboard'
import {Logout} from './Logout';
import Login from './Login'
import Header from './Header'
import Timelog from './Timelog';
import Reports from './Reports';
import Profile from './Profile'

import ProtectedRoute from './common/ProtectedRoute'
import {getCurrentUser} from "../services/loginService";

import logger from "../services/logService"

import '../App.css';

class App extends Component {

  state = {}

  componentDidMount() {
    const user = getCurrentUser();
    this.setState({user})
  }

  componentDidCatch(error, errorInfo) {
   logger.logError(error)
  }
  
  render() {
    
    return (
      <React.Fragment>
      <Header user = {this.state.user} />
      <ProtectedRoute path="/dashboard" exact component={Dashboard} />
      <ProtectedRoute path="/timelog/:userId" exact component={Timelog} />
      <ProtectedRoute path="/Reports" exact component={Reports} />
      
      <Switch>
      <Route path="/login" component={Login} />
      <ProtectedRoute path="/profile/:userId" component={Profile} />
     {/* <Route path="/forcepassword" component={Forcepassword} />
      <Route path="/forgotpassword" component={Forgotpassword} />
      <ProtectedRoute authed={isUserAuthenticated()} path="/Timelog" component={TimelogPage} />
      <ProtectedRoute authed={isUserAuthenticated()} path="/Usermanagement" component={UserManagement}/>
      <ProtectedRoute authed={isUserAuthenticated()} path="/UpdatePassword" component={UpdatePassword}/> */}
      <Route path="/Logout" component={Logout} />
      <ProtectedRoute path = "/" exact component = {Dashboard}/>
      {/* <Redirect from="/" exact to="/dashboard" /> */}
      {/* <Route component={NoMatch} /> */}
      </Switch>

    </React.Fragment>
    );
  }
}


export default App;
