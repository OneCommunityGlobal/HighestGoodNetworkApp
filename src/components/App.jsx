import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import axios from 'axios'
import moment from 'moment-timezone'
import jwtDecode from 'jwt-decode';

import routes from '../routes'
import httpService from "../services/httpService";
import { setCurrentUser, logoutUser } from "../actions/authActions"
import configureStore from '../store';
import { PersistGate } from 'redux-persist/integration/react';
import Loading from './common/Loading'
import { ENDPOINTS } from "utils/URL";

import "../App.css";

const { persistor, store } = configureStore();

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

    // If the token has expired or is going to expire within 15 minutes,
    // log the user out.
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
