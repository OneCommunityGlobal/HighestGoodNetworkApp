import React, { useState, useEffect } from "react";
import routes from '../routes'
import logger from "../services/logService";

import httpService from "../services/httpService";
import jwtDecode from 'jwt-decode';
import { setCurrentUser, logoutUser } from "../actions/authActions"
import moment from 'moment-timezone'

import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from '../store';
import { PersistGate } from 'redux-persist/integration/react';
import Loading from './common/Loading'

import { tokenKey } from "../config.json";
import "../App.css";
import { ENDPOINTS } from "utils/URL";
import axios from 'axios'

const { persistor, store } = configureStore();

const SECOND = 1
const HOUR = 60 * SECOND
const DAY = 24 * HOUR

const TOKEN_LIFETIME_BUFFER = 2 * DAY;

/***********/
if (localStorage.getItem(tokenKey)) {

  const decoded = jwtDecode(localStorage.getItem(tokenKey));

  const currentTime = Date.now() / 1000;
  const expiryTime = new Date(decoded.expiryTimestamp).getTime() / 1000;

  if (expiryTime - TOKEN_LIFETIME_BUFFER < currentTime) {

    store.dispatch(logoutUser());
  }
  else {
    httpService.setjwt(localStorage.getItem(tokenKey));
    store.dispatch(setCurrentUser(decoded));
  }
}
/***********/



const App = () => {

  const [initialized, setInitialized] = useState(false);

  const initialize = () => {

    const plainTextRefreshToken = localStorage.getItem('refreshToken');

    if(!plainTextRefreshToken) {
      store.dispatch(logoutUser());
      setInitialized(true);
      return;
    }

    const refreshToken = JSON.parse(plainTextRefreshToken);

    const refreshTokenExpirationDate = moment(new Date(refreshToken.expirationDate))
    const now = moment();

    if(now.diff(refreshTokenExpirationDate, 'minutes') > -15) {
      store.dispatch(logoutUser());
      setInitialized(true);
      return;
    } 

    axios.post(ENDPOINTS.REFRESH_TOKEN(), {
      refreshToken: refreshToken.token
    })
    .then((res) => {
      const decoded = jwtDecode(res.data.token);
      httpService.setjwt(res.data.token);
      store.dispatch(setCurrentUser(decoded));
      localStorage.setItem('refreshToken', JSON.stringify(res.data.refreshToken))
      setInitialized(true);
    })
    .catch((err) => {
      console.log(err);
      alert('There was an error signing into the Highest Good Network app. Please try again. If the problem persists, contact technical support.')
    })

  }

  useEffect(initialize, []);

  if(!initialized) return <Loading/>

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading/>} persistor={persistor}>
        <Router>
          { routes }
        </Router>
      </PersistGate>
    </Provider>
  );

}

export default App;
