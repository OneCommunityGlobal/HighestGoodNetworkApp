import axios from 'axios';
import moment from 'moment';
import {
  FETCH_USER_PROFILES_ERROR,
  FETCH_USER_PROFILES_START,
  RECEIVE_ALL_USER_PROFILES,
  USER_PROFILE_UPDATE,
  USER_PROFILE_DELETE,
} from '../constants/userManagement';
import { ENDPOINTS } from '../utils/URL';
import { UserStatus } from '../utils/enums';
import { getTimeEndDateEntriesByPeriod } from './timeEntries';

/**
 * fetching all user profiles
 */
export const getAllUserProfile = () => {
  const userProfilesPromise = axios.get(ENDPOINTS.USER_PROFILES);
  return async dispatch => {
    await dispatch(userProfilesFetchStartAction());
    return userProfilesPromise
      .then(res => {
        dispatch(userProfilesFetchCompleteACtion(res.data));
        return res.data;
      })
      .catch(err => {
        dispatch(userProfilesFetchErrorAction());
      });
  };
};

/**
 * update the user profile
 * @param {*} user - the user to be updated
 * @param {*} status  - Active/InActive
 */
export const updateUserStatus = (user, status, reactivationDate) => {
  const userProfile = { ...user};
  userProfile.isActive = status === UserStatus.Active;
  userProfile.reactivationDate = reactivationDate;
  const patchData = { status, reactivationDate };
  return async dispatch => {
    if (status === UserStatus.InActive) {
      try {
        //Check for last week of work
        const lastEnddate = await dispatch(getTimeEndDateEntriesByPeriod(user._id, user.createdDate, userProfile.toDate));
        if (lastEnddate !== "N/A") { //if work exists, set EndDate to that week
          patchData.endDate = moment(lastEnddate).format('YYYY-MM-DDTHH:mm:ss');
          userProfile.endDate = moment(lastEnddate).format('YYYY-MM-DDTHH:mm:ss');
        } else { //No work exists, set end date to start date
          patchData.endDate = moment(user.createdDate).format('YYYY-MM-DDTHH:mm:ss');
          userProfile.endDate = moment(user.createdDate).format('YYYY-MM-DDTHH:mm:ss');
        }
        const updateProfilePromise = axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
        updateProfilePromise.then(res => {
          dispatch(userProfileUpdateAction(userProfile));
        });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    } else {//user is active
      patchData.endDate = undefined;
      userProfile.endDate = undefined;
      const updateProfilePromise = axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
      updateProfilePromise.then(res => {
        dispatch(userProfileUpdateAction(userProfile));
      });
    }
  };
};

/**
 * Update the rehireable status of a user
 * @param{*} user - the user whose rehireable status is to be updated
 * @param{boolean} isRehireable - the new rehireable status
 */
export const updateRehireableStatus = (user, isRehireable) => {
  const userProfile = { ...user };
  userProfile.isRehireable = isRehireable
  const requestData = { isRehireable };
  
  const updateProfilePromise = axios.patch(ENDPOINTS.UPDATE_REHIREABLE_STATUS(user._id), requestData)
  return async dispatch => {
    updateProfilePromise.then(res => {
      dispatch(userProfileUpdateAction(userProfile));
    });
  };
};

/**
 * Switches the visibility of a user
 * @param{*} user - the user whose visibility is to be changed
 * @param{boolean} isVisible - the new visiblity status
 */
export const toggleVisibility = (user, isVisible) => {
  const userProfile = { ...user };
  userProfile.isVisible = isVisible
  const requestData = { isVisible };
  
  const toggleVisibilityPromise = axios.patch(ENDPOINTS.TOGGLE_VISIBILITY(user._id), requestData)
  return async dispatch => {
    toggleVisibilityPromise.then(res => {
      dispatch(userProfileUpdateAction(userProfile));
    }).catch(err => {
      console.error("failed to toggle visibility: ", err);
    });
  };

};

/**
 * delete an existing user
 * @param {*} user  - the user to be deleted
 * @param {*} option - archive / delete
 */
export const deleteUser = (user, option) => {
  const requestData = { option, userId: user._id };
  const deleteProfilePromise = axios.delete(ENDPOINTS.USER_PROFILE(user._id), {
    data: requestData,
  });
  return async dispatch => {
    deleteProfilePromise
      .then(res => {
        dispatch(userProfileDeleteAction(user));
      })
      .catch(err => {
        dispatch(userProfileDeleteAction(user));
      });
  };
};

/**
 * Set a flag that fetching user profiles
 */
export const userProfilesFetchStartAction = () => {
  return {
    type: FETCH_USER_PROFILES_START,
  };
};

/**
 * set Projects in store
 * @param payload : projects []
 */
export const userProfilesFetchCompleteACtion = payload => {
  return {
    type: RECEIVE_ALL_USER_PROFILES,
    payload,
  };
};

/**
 * Error when setting the user profiles list
 * @param payload : error status code
 */
export const userProfilesFetchErrorAction = payload => {
  return {
    type: FETCH_USER_PROFILES_ERROR,
    payload,
  };
};

/**
 * Action for Updating an user profile
 * @param {*} user : the updated user
 */
export const userProfileUpdateAction = user => {
  return {
    type: USER_PROFILE_UPDATE,
    user,
  };
};

/**
 * Delete user profile action
 * @param {*} user : the deleted user
 */
export const userProfileDeleteAction = user => {
  return {
    type: USER_PROFILE_DELETE,
    user,
  };
};

/**
 * update the user final day status
 * @param {*} user - the user to be updated
 * @param {*} finalDate  - the date to be inactive
 */
export const updateUserFinalDayStatus = (user, status, finalDayDate) => {
  const userProfile = { ...user};
  userProfile.endDate = finalDayDate;
  userProfile.isActive = status === 'Active';
  const patchData = { status, endDate: finalDayDate };
  if (finalDayDate === undefined) {
    patchData.endDate = undefined;
    userProfile.endDate = undefined;
  } else {
    userProfile.endDate = moment(finalDayDate).format('YYYY-MM-DD');
    patchData.endDate = moment(finalDayDate).format('YYYY-MM-DD');
  }

  const updateProfilePromise = axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
  return async dispatch => {
    updateProfilePromise.then(res => {
      dispatch(userProfileUpdateAction(userProfile));
    });
  };
};

export const updateUserFinalDayStatusIsSet = (user, status, finalDayDate, isSet) => {
  const userProfile = { ...user};
  userProfile.endDate = finalDayDate;
  userProfile.isActive = status === 'Active';
  userProfile.isSet = isSet === 'FinalDay';
  const patchData = { status, endDate: finalDayDate, isSet };
  if (finalDayDate === undefined) {
    patchData.endDate = undefined;
    userProfile.endDate = undefined;
  } else {
    userProfile.endDate = moment(finalDayDate).format('YYYY-MM-DD');
    patchData.endDate = moment(finalDayDate).format('YYYY-MM-DD');
  }

  const updateProfilePromise = axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
  return async dispatch => {
    updateProfilePromise.then(res => {
      dispatch(userProfileUpdateAction(userProfile));
    });
  };
};