import React, { Component } from 'react';
import Header from '../common/Header';
import {Route,Switch,Redirect} from 'react-router-dom';
import '../App.css';
import DashBoardPage from './DashBoard/DashBoardPage';
import TimelogPage from './Timelog/TimelogPage';
import Login from './Login/LoginPage';
import Forcepassword from './Login/ForcepasswordPage';
import Forgotpassword from './Login/ForgotpasswordPage';
import UserManagement from './UserManagement/usermanagementPage';
import {Logout} from './Logout';
import UpdatePassword from './Profile/UpdatePasswordPage';
import {isUserAuthenticated} from "../services/loginService";

//To Do: Remove the nomatch code from here

const NoMatch = ({ location }) => (
  <div>
    <h3>
      No match for <code>{location.pathname}</code>
    </h3>
  </div>
);


const PrivateRoute = ({component: Component, authed, ...rest}) => {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : <Redirect to={{pathname: '/login', state: {from: props.location}}} />} />
  )
}

const Routes = () => {
  return (
   
      <Switch>
      <PrivateRoute authed={isUserAuthenticated()} exact path="/" component={DashBoardPage} />
      <Route path="/Login" component={Login} />
      <Route path="/forcepassword" component={Forcepassword} />
      <Route path="/forgotpassword" component={Forgotpassword} />
      <PrivateRoute authed={isUserAuthenticated()} path="/DashBoard" component={DashBoardPage} />
      <PrivateRoute authed={isUserAuthenticated()} path="/Timelog" component={TimelogPage} />
      <PrivateRoute authed={isUserAuthenticated()} path="/Usermanagement" component={UserManagement}/>
      <PrivateRoute authed={isUserAuthenticated()} path="/UpdatePassword" component={UpdatePassword}/>
      <Route path="/Logout" component={Logout} />
      <Route component={NoMatch} />
      </Switch>
  
  );
}



//Application Class
class App extends Component {
  
  render() {
    
    return (
      <div>
          {isUserAuthenticated() && <Header /> }
          <Routes/>
      </div>
    );
  }
}


export default App;
