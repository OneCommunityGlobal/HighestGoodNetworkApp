import jwtDecode from 'jwt-decode';
import axios from 'axios';
import httpService from '../services/httpService';
import config from '../config.json';
import { ENDPOINTS } from '../utils/URL';
import { GET_ERRORS } from '../constants/errors';
import { SET_CURRENT_USER, SET_HEADER_DATA } from '../constants/auth';

const { tokenKey } = config;

export const loginUser = credentials => dispatch => {
  return httpService
    .post(ENDPOINTS.LOGIN, credentials)
    .then(res => {
      if (res.data.new) {
        dispatch(setCurrentUser({ new: true, userId: res.data.userId }));
      } else {
        localStorage.setItem(tokenKey, res.data.token);
        httpService.setjwt(res.data.token);
        const decoded = jwtDecode(res.data.token);
        dispatch(setCurrentUser(decoded));
      }
    })
    .catch(err => {
      let errors;
      if (err.response && err.response.status === 404) {
        errors = { password: err.response.data.message };
        dispatch({
          type: GET_ERRORS,
          payload: errors,
        });
      } else if (err.response && err.response.status === 403) {
        errors = { email: err.response.data.message };
        dispatch({
          type: GET_ERRORS,
          payload: errors,
        });
      }
    });
};

export const loginBMUser = (credentials) => async dispatch => {
  return httpService
    .post(ENDPOINTS.BM_LOGIN, credentials)
    .then((res) => {
      localStorage.setItem(tokenKey, res.data.token);
      httpService.setjwt(res.data.token);
      const decoded = jwtDecode(res.data.token)
      dispatch(setCurrentUser(decoded));
      return res
    })
    .catch(err => err.response)
}

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

export const logoutUser = () => dispatch => {
  localStorage.removeItem(tokenKey);
  httpService.setjwt(false);
  dispatch(setCurrentUser(null));
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

export const setCurrentUser = decoded => ({
  type: SET_CURRENT_USER,
  payload: decoded,
});

export const setHeaderData = data => ({
  type: SET_HEADER_DATA,
  payload: data,
});