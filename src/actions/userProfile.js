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

// Action Creators defined first to avoid 'no-use-before-define' errors
export const getUserProfileActionCreator = (data) => ({
  type: GET_USER_PROFILE,
  payload: data,
});

export const getUserTaskActionCreator = (data) => ({
  type: GET_USER_TASKS,
  payload: data,
});

export const editFirstNameActionCreator = (data) => ({
  type: EDIT_FIRST_NAME,
  payload: data,
});

export const putUserProfileActionCreator = (data) => ({
  type: EDIT_USER_PROFILE,
  payload: data,
});

export const getProjectsByPersonActionCreator = (data) => ({
  type: GET_PROJECT_BY_USER_NAME,
  payload: data
});

const userNotFoundError = (error) => ({
  type: USER_NOT_FOUND_ERROR,
  payload: error,
});

export const getUserProfile = (userId) => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async (dispatch) => {
    let loggedOut = false;
    try {
      const res = await axios.get(url);
      const resp = dispatch(getUserProfileActionCreator(res.data));
      return resp.payload;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle logout if needed
        loggedOut = true;
      }
      if (!loggedOut) {
        dispatch(userNotFoundError(error.message || 'An error occurred'));
        return Promise.reject(error); // Ensures a consistent return
      }
    }
  };
};

export const getUserTasks = (userId) => {
  const url = ENDPOINTS.TASKS_BY_USERID(userId);
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      if (res.status === 200) {
        dispatch(getUserTaskActionCreator(res.data));
        return res.data; // Ensures a consistent return
      } 
        // Replace console.log with another error handling mechanism
        toast.error(`Get user task request failed: ${res.statusText}`);
        return Promise.reject(new Error(`Status: ${res.status}`));
      
    } catch (error) {
      // Replace console.log with another error handling mechanism
      toast.error(`Error fetching user tasks: ${error.message}`);
      return Promise.reject(error); // Ensures a consistent return
    }
  };
};

export const editFirstName = (data) => (dispatch) => {
  dispatch(editFirstNameActionCreator(data));
  // Optionally return something if needed
};

export const putUserProfile = (data) => (dispatch) => {
  dispatch(putUserProfileActionCreator(data));
  // Optionally return something if needed
};

export const clearUserProfile = () => ({ type: CLEAR_USER_PROFILE });

export const updateUserProfile = (userProfile) => {
  const url = ENDPOINTS.USER_PROFILE(userProfile._id);
  return async (dispatch) => {
    try {
      const res = await axios.put(url, userProfile);
      if (res.status === 200) {
        await dispatch(getUserProfileActionCreator(userProfile));
        return res.status;
      } 
        // Replace console.log with another error handling mechanism
        toast.error(`Update failed: ${res.statusText}`);
        return Promise.reject(new Error(`Status: ${res.status}`));
      
    } catch (error) {
      // Replace console.log with another error handling mechanism
      toast.error(`Error updating profile: ${error.message}`);
      return Promise.reject(error); // Ensures a consistent return
    }
  };
};

export const updateUserProfileProperty = (userProfile, key, value) => {
  const url = ENDPOINTS.USER_PROFILE_PROPERTY(userProfile._id);
  return async (dispatch) => {
    try {
      const res = await axios.patch(url, { key, value });
      if (res.status === 200) {
        await dispatch(getUserProfileActionCreator(userProfile));
        return res.status;
      } 
        // Replace console.log with another error handling mechanism
        toast.error(`Update property failed: ${res.statusText}`);
        return Promise.reject(new Error(`Status: ${res.status}`));
      
    } catch (error) {
      // Replace console.log with another error handling mechanism
      toast.error(`Error updating profile property: ${error.message}`);
      return Promise.reject(error); // Ensures a consistent return
    }
  };
};

export const getProjectsByUsersName = (searchName) => {
  const url = ENDPOINTS.GET_PROJECT_BY_PERSON(searchName);
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      dispatch(getProjectsByPersonActionCreator(res.data));
      return res.data.allProjects;
    } catch (error) {
      dispatch(userNotFoundError(error.message || 'An error occurred'));
      dispatch(getProjectsByPersonActionCreator([]));
      toast.error('Could not find user or project, please try again');
      return Promise.reject(error); // Ensures a consistent return
    }
  };
};
