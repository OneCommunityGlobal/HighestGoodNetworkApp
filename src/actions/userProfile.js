import axios from 'axios';
import {
  GET_USER_PROFILE,
  GET_USER_TASKS,
  EDIT_FIRST_NAME,
  EDIT_USER_PROFILE,
  CLEAR_USER_PROFILE,
} from '../constants/userProfile';
import { ENDPOINTS } from '../utils/URL';

export const getUserProfile = userId => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    let loggedOut = false;
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
        // logout error
        loggedOut = true;
      }
    });
    if (!loggedOut) {
      const resp = await dispatch(getUserProfileActionCreator(res.data));
      return resp.payload;
    }
  };
};

export const getUserTasks = userId => {
  const url = ENDPOINTS.TASKS_BY_USERID(userId);
  return async dispatch => {
    const res = await axios.get(url);
    if (res.status === 200) {
      await dispatch(getUserTaskActionCreator(res.data));
    }
  };
};

export const editFirstName = data => dispatch => {
  dispatch(editFirstNameActionCreator(data));
};

export const putUserProfile = data => dispatch => {
  dispatch(putUserProfileActionCreator(data));
};

export const clearUserProfile = () => ({ type: CLEAR_USER_PROFILE });

export const updateUserProfile = (userId, userProfile) => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    const res = await axios.put(url, userProfile);
    if (res.status === 200) {
      await dispatch(getUserProfileActionCreator(userProfile));
    }
    return res.status;
  };
};

export const updateUserProfileProperty = (userProfile, key, value) => {
  const url = ENDPOINTS.USER_PROFILE_PROPERTY(userProfile._id);
  return async dispatch => {
    const res = await axios.patch(url, { key, value });
    if (res.status === 200) {
      await dispatch(getUserProfileActionCreator(userProfile));
    }
    return res.status;
  };
};

export const getUserProfileActionCreator = data => ({
  type: GET_USER_PROFILE,
  payload: data,
});

export const getUserTaskActionCreator = data => ({
  type: GET_USER_TASKS,
  payload: data,
});

export const editFirstNameActionCreator = data => ({
  type: EDIT_FIRST_NAME,
  payload: data,
});

export const putUserProfileActionCreator = data => ({
  type: EDIT_USER_PROFILE,
  payload: data,
});