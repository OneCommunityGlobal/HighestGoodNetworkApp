import axios from 'axios';
import {
  getUserProfile as getUserProfileActionCreator,
  getUserTask as getUserTaskActionCreator,
  editFirstName as editFirstNameActionCreator,
  putUserProfile as putUserProfileActionCreator,
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
      return resp.payload
    }
  };
};

export const getUserTask = userId => {
  const url = ENDPOINTS.TASKS_BY_USERID(userId);
  return async dispatch => {
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
      }
    });
    await dispatch(getUserTaskActionCreator(res.data));
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
    const res = await axios.patch(url, {key, value});
    if (res.status === 200) {
      await dispatch(getUserProfileActionCreator(userProfile));
    }
    return res.status;
  };
};
