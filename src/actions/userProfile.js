import axios from 'axios';
import {
  GET_USER_PROFILE,
  GET_USER_TASKS,
  EDIT_FIRST_NAME,
  EDIT_USER_PROFILE,
  CLEAR_USER_PROFILE,
  GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME,
  USER_NOT_FOUND_ERROR,
} from '../constants/userProfile';
import { ENDPOINTS } from '../utils/URL';
import { toast } from 'react-toastify';

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
      const resp = dispatch(getUserProfileActionCreator(res.data));
      return resp.payload;
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
        console.log(`Get user task request status is not 200, status message: ${res.statusText}`)
      }
    } catch (error) {
      console.log(error);
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
    try{
        const res = await axios.patch(url, { key, value });
        if (res.status === 200) {
          
          await dispatch(getUserProfileActionCreator(userProfile));
        }
        return res.status;
    }catch(error){
      console.log('An error while retrieving the projects',error)
    }
    
  };
};
const userNotFoundError = (error) =>({
  type: USER_NOT_FOUND_ERROR,
  payload: error,
}) 


export const getProjectsByUsersName = (firstName, lastName) => {

  const url = ENDPOINTS.GET_PROJECT_BY_PERSON(firstName,lastName);
  return async dispatch => {
    try{
    const res = await axios.get(url);
    if(!res.status === 200){
      await dispatch(userNotFoundError("Could not find user"));
      await dispatch(getProjectsByPersonActionCreator([]));
      toast.error("Could not find user");
    }
    if (res.status === 200){
      await dispatch(getProjectsByPersonActionCreator(res.data));
    }
    return res.status
    }catch(error){
      await dispatch(userNotFoundError(error));
      toast.error("Could not find user, please try again");
      await dispatch(getProjectsByPersonActionCreator([]));
    }
    
  }
}

export const getProjectsByPersonActionCreator = data => ({
  type: GET_PROJECT_BY_FIRSTNAME_AND_LASTNAME,
  payload: data
})

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