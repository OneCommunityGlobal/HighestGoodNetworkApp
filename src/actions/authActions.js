import jwtDecode from 'jwt-decode';
import axios from 'axios';
import httpService from '../services/httpService';
import config from '../config.json';
import { ENDPOINTS } from '~/utils/URL';
import { GET_ERRORS } from '../constants/errors';
import {
  SET_CURRENT_USER,
  SET_HEADER_DATA,
  START_FORCE_LOGOUT,
} from '../constants/auth';

const { tokenKey } = config;

export const setCurrentUser = decoded => ({
  type: SET_CURRENT_USER,
  payload: decoded,
});

export const setHeaderData = data => ({
  type: SET_HEADER_DATA,
  payload: data,
});

export const loginUser = credentials => dispatch => {
  return httpService
    .post(ENDPOINTS.LOGIN, credentials)
    .then(res => {
      if (res.data.new) {
        dispatch(setCurrentUser({ new: true, userId: res.data.userId }));
        return { success: true, new: true };
      }
      localStorage.setItem(tokenKey, res.data.token);
      httpService.setjwt(res.data.token);
      const decoded = jwtDecode(res.data.token);
      dispatch(setCurrentUser(decoded));
      return { success: true };
    })
    .catch(err => {
      let errors;
      if (err.response && err.response.status === 404) {
        errors = { password: err.response.data.message };
      } else if (err.response && err.response.status === 403) {
        errors = { email: err.response.data.message };
      } else {
        errors = { email: 'An error occurred during login.' };
      }

      dispatch({
        type: GET_ERRORS,
        payload: errors,
      });

      return { success: false, errors };
    });
};

export const loginBMUser = credentials => async dispatch => {
  return httpService
    .post(ENDPOINTS.BM_LOGIN, credentials)
    .then(res => {
      localStorage.setItem(tokenKey, res.data.token);
      httpService.setjwt(res.data.token);
      const decoded = jwtDecode(res.data.token);
      dispatch(setCurrentUser(decoded));
      return res;
    })
    .catch(err => err.response);
};

// end points needed for community Portal

// export const loginBMUser = (credentials) => async dispatch => {
//   return httpService
//     .post (ENDPOINTS.BM_LOGIN, credentials)
//     .then((res) => {
//       localStorage.setItem(tokenKey, res.data.token);
//       httpService.setjwt(res.data.token);
//       const decoded = jwtDecode(res.data.token)
//       dispatch(setCurrentUser(decoded));
//       return res
//     })
//     .catch(err => err.response)
// }

export const getHeaderData = userId => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    const res = await axios.get(url);

    await dispatch(
      setHeaderData({
        firstName: res.data.firstName,
        profilePic: res.data.profilePic,
      }),
    );
  };
};

export const logoutUser = (isCrossTabLogout = false) => dispatch => {
  // Only signal other tabs if this is NOT a cross-tab logout
  // (to prevent infinite loops when responding to storage events)
  if (!isCrossTabLogout) {
    // Set a flag to signal other tabs to log out
    // This flag will trigger a storage event in other tabs
    localStorage.setItem('logoutFlag', 'true');
    
    // Use BroadcastChannel API for more reliable cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('auth_sync');
        channel.postMessage({ type: 'logout', timestamp: Date.now() });
        // Close the channel after sending
        setTimeout(() => channel.close(), 100);
      } catch (error) {
        console.warn('BroadcastChannel not available:', error);
      }
    }
    
    // Clear the logout flag after a short delay to allow other tabs to detect it
    // We use setTimeout to ensure the storage event fires first
    setTimeout(() => {
      localStorage.removeItem('logoutFlag');
    }, 500);
  }
  
  // Remove the token
  localStorage.removeItem(tokenKey);
  
  httpService.setjwt(false);
  dispatch(setCurrentUser(null));
};

/**
 * Starts a force logout countdown that will automatically log out the user after the specified delay
 * @param {number} delayMs - Delay in milliseconds before force logout (default 20000ms)
 * @returns {Function} - Thunk function
 */
export const startForceLogout = (delayMs = 20000) => (dispatch, getState) => {
  const forceLogoutAt = Date.now() + delayMs;

  // Set the timer to execute logout after delay
  const timerId = setTimeout(async () => {
    try {
      const { userProfile } = getState();
      
      if (userProfile && userProfile._id) {
        const { firstName: name, lastName, personalLinks, adminLinks, _id } = userProfile;
        
        await axios.put(ENDPOINTS.USER_PROFILE(_id), {
          firstName: name,
          lastName,
          personalLinks,
          adminLinks,
          isAcknowledged: true,
        });
        
        // eslint-disable-next-line no-console
        console.log('Permission changes acknowledged during force logout');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error acknowledging permissions during force logout:', error);
    } finally {
      dispatch(logoutUser());
    }
  }, delayMs);

  dispatch({
    type: START_FORCE_LOGOUT,
    payload: { forceLogoutAt, timerId },
  });

  return forceLogoutAt;
};

export const refreshToken = userId => {
  return async dispatch => {
    const res = await axios.get(ENDPOINTS.USER_REFRESH_TOKEN(userId));
    if (res.status === 200) {
      localStorage.setItem(tokenKey, res.data.refreshToken);
      httpService.setjwt(res.data.refreshToken);
      const decoded = jwtDecode(res.data.refreshToken);
      dispatch(setCurrentUser(decoded));
    }
    return res.status;
  };
};
