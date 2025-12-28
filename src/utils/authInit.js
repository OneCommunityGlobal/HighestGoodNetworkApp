/* eslint-disable no-undef */
import jwtDecode from 'jwt-decode';
import httpService from '../services/httpService';
import { store } from '../store';
import { setCurrentUser, logoutUser } from '../actions/authActions';
import config from '../config.json';

const TOKEN_LIFETIME_BUFFER = 86400 * 2; // two days in seconds

export default function initAuth() {
  const token = localStorage.getItem(config.tokenKey);
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const nowSec = Date.now() / 1000;
    const expirySec = new Date(decoded.expiryTimestamp).getTime() / 1000;

    if (expirySec - TOKEN_LIFETIME_BUFFER < nowSec) {
      store.dispatch(logoutUser());
    } else {
      httpService.setjwt(token);
      store.dispatch(setCurrentUser(decoded));
    }
  } catch (error) {
    // Token is invalid, expired, or malformed - clear it and log out
    // eslint-disable-next-line no-console
    console.warn('Invalid token detected, logging out user:', error.message);
    localStorage.removeItem(config.tokenKey);
    store.dispatch(logoutUser());
  }
}