import { Component } from "react";
import routes from '../routes'
import logger from "../services/logService";
import configureStore from '../store';
import httpService from "../services/httpService";
import jwtDecode from 'jwt-decode';
import {setCurrentUser} from "../actions/authActions"
import config from "../config.json";

import "../App.css";
const { persistor, store } = configureStore();
const tokenKey = config.tokenKey;

// Check for token
if (localStorage.getItem(tokenKey)) {
  // Set auth token header auth
  httpService.setjwt(localStorage.getItem(tokenKey));
  // Decode token and get user info and exp
  const decoded = jwtDecode(localStorage.getItem(tokenKey));
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  // Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.expiryTimestamp < currentTime) {
    // // Logout user
    // store.dispatch(logoutUser());
    store.dispatch(setCurrentUser(null));
    // // Clear profile state
    // store.dispatch(clearProfile());
    // Redirect to login
    window.location.href = "/login";
  }
}
else{
  store.dispatch(setCurrentUser(null));
}

class App extends Component {
  state = {};

  componentDidCatch(error, errorInfo) {
    logger.logError(error);
  }

  render() {
    return (
     routes
 
    );
  }
}

export default App;
