import axios from 'axios';
import { toast } from 'react-toastify';
import logService from './logService';
import { store } from '../store';
import { logoutUser } from '../actions/authActions';
import { ENDPOINTS } from '../utils/URL';
import jwtDecode from 'jwt-decode';
import config from '../config.json';

if (axios.defaults && axios.defaults.headers && axios.defaults.headers.post) {
  axios.defaults.headers.post['Content-Type'] = 'application/json';
}

// Track if we're currently refreshing the token to avoid multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

if (axios.interceptors && axios.interceptors.response && axios.interceptors.response.use) {
  axios.interceptors.response.use(null, async error => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Don't retry refresh token endpoint itself
      if (originalRequest.url && originalRequest.url.includes('/refreshToken/')) {
        // Refresh token failed, logout user
        store.dispatch(logoutUser());
        toast.error('Session expired. Please log in again.');
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = token;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // Try to refresh the token
      const state = store.getState();
      const userId = state?.auth?.user?.userid;

      if (!userId) {
        // No user ID, can't refresh - logout
        store.dispatch(logoutUser());
        toast.error('Session expired. Please log in again.');
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const refreshResponse = await axios.get(ENDPOINTS.USER_REFRESH_TOKEN(userId));

        if (refreshResponse.status === 200 && refreshResponse.data.refreshToken) {
          const newToken = refreshResponse.data.refreshToken;
          const { tokenKey } = config;

          // Store new token
          localStorage.setItem(tokenKey, newToken);
          setjwt(newToken);

          // Update Redux store with new token data
          try {
            const decoded = jwtDecode(newToken);
            store.dispatch({
              type: 'SET_CURRENT_USER',
              payload: decoded,
            });
          } catch (decodeError) {
            console.error('Error decoding refreshed token:', decodeError);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = newToken;

          // Process queued requests
          processQueue(null, newToken);
          isRefreshing = false;

          return axios(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        isRefreshing = false;
        store.dispatch(logoutUser());
        toast.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (!(error.response && error.response.status >= 400 && error.response.status <= 500)) {
      logService.log(error);
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  });
}

function setjwt(jwt) {
  if (jwt) {
    axios.defaults.headers.common.Authorization = jwt;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export default {
  get: axios.get,
  post: axios.post,
  delete: axios.delete,
  patch: axios.patch,
  put: axios.put,
  setjwt,
};
