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
 * Action Creators defined first to avoid 'no-use-before-define' errors
 */
export const userProfilesFetchStartAction = () => ({
  type: FETCH_USER_PROFILES_START,
});

export const userProfilesFetchCompleteAction = (payload) => ({
  type: RECEIVE_ALL_USER_PROFILES,
  payload,
});

export const userProfilesFetchErrorAction = (payload) => ({
  type: FETCH_USER_PROFILES_ERROR,
  payload,
});

export const userProfileUpdateAction = (user) => ({
  type: USER_PROFILE_UPDATE,
  user,
});

export const userProfileDeleteAction = (user) => ({
  type: USER_PROFILE_DELETE,
  user,
});

/**
 * Fetching all user profiles
 */
export const getAllUserProfile = () => {
  const userProfilesPromise = axios.get(ENDPOINTS.USER_PROFILES);
  return async (dispatch) => {
    await dispatch(userProfilesFetchStartAction());
    return userProfilesPromise
      .then((res) => {
        dispatch(userProfilesFetchCompleteAction(res.data));
        return res.data;
      })
      .catch(() => {
        dispatch(userProfilesFetchErrorAction('Failed to fetch user profiles'));
      });
  };
};

/**
 * Update the user status
 * @param {*} user - the user to be updated
 * @param {*} status - Active/InActive
 * @param {*} reactivationDate - Reactivation date if applicable
 */
export const updateUserStatus = (user, status, reactivationDate) => {
  const userProfile = { ...user };
  userProfile.isActive = status === UserStatus.Active;
  userProfile.reactivationDate = reactivationDate;
  const patchData = { status, reactivationDate };
  return async (dispatch) => {
    if (status === UserStatus.InActive) {
      try {
        // Check for last week of work
        const lastEnddate = await dispatch(
          getTimeEndDateEntriesByPeriod(user._id, user.createdDate, userProfile.toDate)
        );
        if (lastEnddate !== 'N/A') {
          // if work exists, set EndDate to that week
          patchData.endDate = moment(lastEnddate).format('YYYY-MM-DDTHH:mm:ss');
          userProfile.endDate = moment(lastEnddate).format('YYYY-MM-DDTHH:mm:ss');
        } else {
          // No work exists, set end date to start date
          patchData.endDate = moment(user.createdDate).format('YYYY-MM-DDTHH:mm:ss');
          userProfile.endDate = moment(user.createdDate).format('YYYY-MM-DDTHH:mm:ss');
        }
        await axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
        dispatch(userProfileUpdateAction(userProfile));
      } catch (error) {
        // Replaced console.error with dispatching an error action
        dispatch(userProfilesFetchErrorAction('Error updating user status'));
      }
    } else {
      // User is active
      patchData.endDate = undefined;
      userProfile.endDate = undefined;
      try {
        await axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
        dispatch(userProfileUpdateAction(userProfile));
      } catch (error) {
        // Replaced console.error with dispatching an error action
        dispatch(userProfilesFetchErrorAction('Error updating user status'));
      }
    }
  };
};

/**
 * Update the rehireable status of a user
 * @param {*} user - the user whose rehireable status is to be updated
 * @param {boolean} isRehireable - the new rehireable status
 */
export const updateRehireableStatus = (user, isRehireable) => {
  const userProfile = { ...user };
  userProfile.isRehireable = isRehireable;
  const requestData = { isRehireable };

  return async (dispatch) => {
    try {
      await axios.patch(ENDPOINTS.UPDATE_REHIREABLE_STATUS(user._id), requestData);
      dispatch(userProfileUpdateAction(userProfile));
    } catch (error) {
      dispatch(userProfilesFetchErrorAction('Error updating rehireable status'));
    }
  };
};

/**
 * Delete an existing user
 * @param {*} user - the user to be deleted
 * @param {*} option - archive / delete
 */
export const deleteUser = (user, option) => {
  const requestData = { option, userId: user._id };
  const deleteProfilePromise = axios.delete(ENDPOINTS.USER_PROFILE(user._id), {
    data: requestData,
  });
  return async (dispatch) => {
    deleteProfilePromise
      .then(() => {
        dispatch(userProfileDeleteAction(user));
      })
      .catch(() => {
        dispatch(userProfileDeleteAction(user));
      });
  };
};

/**
 * Update the user's final day status
 * @param {*} user - the user to be updated
 * @param {*} status - Active/InActive
 * @param {*} finalDayDate - The date to be inactive
 */
export const updateUserFinalDayStatus = (user, status, finalDayDate) => {
  const userProfile = { ...user };
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

  return async (dispatch) => {
    try {
      await axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
      dispatch(userProfileUpdateAction(userProfile));
    } catch (error) {
      dispatch(userProfilesFetchErrorAction('Error updating final day status'));
    }
  };
};

/**
 * Update the user's final day status with 'isSet' flag
 * @param {*} user - the user to be updated
 * @param {*} status - Active/InActive
 * @param {*} finalDayDate - The date to be inactive
 * @param {*} isSet - Flag indicating if the final day is set
 */
export const updateUserFinalDayStatusIsSet = (user, status, finalDayDate, isSet) => {
  const userProfile = { ...user };
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

  return async (dispatch) => {
    try {
      await axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
      dispatch(userProfileUpdateAction(userProfile));
    } catch (error) {
      dispatch(userProfilesFetchErrorAction('Error updating final day status'));
    }
  };
};
