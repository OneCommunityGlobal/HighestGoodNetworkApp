import React, { Component } from "react";
import {Switch} from 'react-router-dom';

import Header from "./Header";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import Timelog from '../components/Timelog';
// import Reports from '../components/Reports';
// import Profile from '../components/Profile'
// import {Route, Switch} from 'react-router-dom';
// import Dashboard from '../components/Dashboard'
// import {Logout} from '../components/Logout';
// import Login from '../components/Login';
// import ForcePasswordUpdate from '../components/Logout';
// import ProtectedRoute from '../components/common/ProtectedRoute'
// import UpdatePassword from '../components/UpdatePassword'
import Routes from '../routes'
import logger from "../services/logService";

import "../App.css";

class App extends Component {
  state = {};

  // componentDidMount() {
  //   const user = getCurrentUser();
  //   this.setState({ user });
  // }

  componentDidCatch(error, errorInfo) {
    logger.logError(error);
  }

  render() {
    return (
      <React.Fragment>
        <Header />
        <ToastContainer />
        <Switch>
  <Routes/>
 </Switch>
      </React.Fragment>
    );
  }
}

export default App;
