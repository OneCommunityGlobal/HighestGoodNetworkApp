import axios from 'axios';
import { toast } from 'react-toastify';
import {
  GET_USER_PROFILE,
  GET_USER_TASKS,
  EDIT_FIRST_NAME,
  EDIT_USER_PROFILE,
  CLEAR_USER_PROFILE,
  GET_PROJECT_BY_USER_NAME,
  USER_NOT_FOUND_ERROR
} from '../constants/userProfile';
import { ENDPOINTS } from '../utils/URL';

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

const userNotFoundError = (error) =>({
  type: USER_NOT_FOUND_ERROR,
  payload: error,
});

export const getProjectsByPersonActionCreator = data => ({
  type: GET_PROJECT_BY_USER_NAME,
  payload: data
});

export const getUserProfile = userId => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    try {
      const res = await axios.get(url);
      dispatch(getUserProfileActionCreator(res.data));
      return res.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
      }
      return error.response ? error.response.status : 500;
    }
  };
};

export const getUserTasks = userId => {
  const url = ENDPOINTS.TASKS_BY_USERID(userId);
  return async dispatch => {
    try {
      const res = await axios.get(url);
      if (res.status === 200) {
        dispatch(getUserTaskActionCreator(res.data));
      } else {
        toast.warn(`Unexpected response status: ${res.status}`);
      }
      return res.status;
    } catch (error) {
      return error.response ? error.response.status : 500;
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

export const updateUserProfile = (userProfile) => {
  const url = ENDPOINTS.USER_PROFILE(userProfile._id);
  return async dispatch => {
    try {
      const res = await axios.put(url, userProfile);
      if (res.status === 200) {
        dispatch(getUserProfileActionCreator(userProfile));
      }
      return res.status;
    } catch (error) {
      return error.response ? error.response.status : 500;
    }
  };
};

export const updateUserProfileProperty = (userProfile, key, value) => {
  const url = ENDPOINTS.USER_PROFILE_PROPERTY(userProfile._id);
  return async dispatch => {
    try {
      const res = await axios.patch(url, { key, value });
      if (res.status === 200) {
        dispatch(getUserProfileActionCreator(userProfile));
      }
      return res.status;
    } catch (error) {
      return error.response ? error.response.status : 500;
    }
  };
};

export const getProjectsByUsersName = searchName => {
  const url = ENDPOINTS.GET_PROJECT_BY_PERSON(searchName);
  return async dispatch => {
    try {
      const res = await axios.get(url);
      dispatch(getProjectsByPersonActionCreator(res.data));
      return res.data.allProjects;
    } catch (error) {
      dispatch(userNotFoundError(error.message));
      dispatch(getProjectsByPersonActionCreator([]));
      toast.error("Could not find user or project, please try again");
      return null;
    }
  };
};