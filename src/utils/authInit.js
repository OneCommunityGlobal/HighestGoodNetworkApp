/* eslint-disable no-undef */
import jwtDecode from 'jwt-decode';
import httpService from '../services/httpService';
import { store } from '../store';
import { setCurrentUser, logoutUser } from '../actions/authActions';
import config from '../config.json';

const TOKEN_LIFETIME_BUFFER = 86400 * 2; // two days in seconds

// Check if we're in a new tab and need to sync auth state
const checkTabAuthSync = () => {
  // If this is a new tab, try to get auth state from other tabs
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem(config.tokenKey);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const nowSec = Date.now() / 1000;
        const expirySec = new Date(decoded.expiryTimestamp).getTime() / 1000;

        // If token is still valid, set it immediately
        if (expirySec - TOKEN_LIFETIME_BUFFER > nowSec) {
          httpService.setjwt(token);
          return decoded;
        }
      } catch (error) {
        console.warn('Failed to decode token in new tab:', error);
      }
    }
  }
  return null;
};

export default function initAuth() {
  // First check if we can sync auth from other tabs
  const syncedUser = checkTabAuthSync();
  if (syncedUser) {
    // Make sure store is ready before dispatching
    if (store && store.dispatch) {
      store.dispatch(setCurrentUser(syncedUser));
    }
    return;
  }

  const token = localStorage.getItem(config.tokenKey);
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const nowSec = Date.now() / 1000;
    const expirySec = new Date(decoded.expiryTimestamp).getTime() / 1000;

    if (expirySec - TOKEN_LIFETIME_BUFFER < nowSec) {
      if (store && store.dispatch) {
        store.dispatch(logoutUser());
      }
    } else {
      httpService.setjwt(token);
      if (store && store.dispatch) {
        store.dispatch(setCurrentUser(decoded));
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    // If token is corrupted, clear it
    localStorage.removeItem(config.tokenKey);
    if (store && store.dispatch) {
      store.dispatch(logoutUser());
    }
  }
}
