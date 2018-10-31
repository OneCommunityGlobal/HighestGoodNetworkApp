import React, { Component } from 'react';
import {Route,Switch,Redirect} from 'react-router-dom';
import '../App.css';
import Dashboard from './Dashboard'
import {Logout} from './Logout';
import Login from './Login'
import Header from './Header'
import PrivateRoute from '../components/common/PrivateRoute'
import {getCurrentUser} from "../services/loginService";

class App extends Component {

  state = {}

  componentDidMount() {
    const user = getCurrentUser();
    this.setState({user})
  }
  
  render() {
    
    return (
      <React.Fragment>
      <Header user = {this.state.user} />
       <Switch>
      <PrivateRoute path ="dashboard" component={Dashboard} />
      <Route path="/Login" component={Login} />
     {/* <Route path="/forcepassword" component={Forcepassword} />
      <Route path="/forgotpassword" component={Forgotpassword} />
      <PrivateRoute authed={isUserAuthenticated()} path="/Timelog" component={TimelogPage} />
      <PrivateRoute authed={isUserAuthenticated()} path="/Usermanagement" component={UserManagement}/>
      <PrivateRoute authed={isUserAuthenticated()} path="/UpdatePassword" component={UpdatePassword}/> */}
      <Route path="/Logout" component={Logout} />
      <Redirect from="/" exact to="/dashboard" />
      {/* <Route component={NoMatch} /> */}
      </Switch>

    </React.Fragment>
    );
  }
}


export default App;
