import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import {
  FETCH_USER_PROFILES_ERROR,
  FETCH_USER_PROFILES_START,
  RECEIVE_ALL_USER_PROFILES,
  USER_PROFILE_UPDATE,
  USER_PROFILE_DELETE,
  FETCH_USER_PROFILE_BASIC_INFO,
  RECEIVE_USER_PROFILE_BASIC_INFO,
  FETCH_USER_PROFILE_BASIC_INFO_ERROR,
  ENABLE_USER_PROFILE_EDIT,
  DISABLE_USER_PROFILE_EDIT,
  CHANGE_USER_PROFILE_PAGE,
  START_USER_INFO_UPDATE,
} from '../constants/userManagement';
import { ENDPOINTS } from '~/utils/URL';
import { UserStatus, UserStatusOperations, InactiveReason } from '~/utils/enums';
import { COMPANY_TZ } from '~/utils/formatDate';

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
 * Error when fetching the user profils basic info
 * @param payload : error status code
 */
export const userProfilesBasicInfoFetchErrorAction = payload => {
  return {
    type: FETCH_USER_PROFILE_BASIC_INFO_ERROR,
    payload,
  };
};

/**
 * Set a flag that starts fetching user profile basic info
 */
export const userProfilesBasicInfoFetchStartAction = () => {
  return {
    type: FETCH_USER_PROFILE_BASIC_INFO,
  };
};

/**
 * Fetching user profile basic info
 * @param payload : projects []
 */
export const userProfilesBasicInfoFetchCompleteACtion = payload => {
  return {
    type: RECEIVE_USER_PROFILE_BASIC_INFO,
    payload,
  };
};

/**
 * fetching all user profiles
 */
export const getAllUserProfile = () => {
  const userProfilesPromise = axios.get(ENDPOINTS.USER_PROFILES);
  return async dispatch => {
    await dispatch(userProfilesFetchStartAction());
    if (!userProfilesPromise || typeof userProfilesPromise.then !== 'function') {
      return Promise.resolve([]);
    }
    return userProfilesPromise
      .then(res => {
        dispatch(userProfilesFetchCompleteACtion(res.data));
        return res.data;
      })
      .catch(() => {
        dispatch(userProfilesFetchErrorAction());
      });
  };
};

/**
 * update the user profile
 * @param {*} user - the user to be updated
 * @param {*} status  - Active/InActive
 */

const resolveEndDate = (user) => {

  //1) endDate + lastActivityAt -> earlier of the two
  if (user?.endDate && user?.lastActivityAt) {
    return moment.min(moment(user.endDate), moment(user.lastActivityAt)).toISOString();
  }

  //2) if no lastActivityAt, use createdDate (if present)
  // format createdDate to real datetime in COMPANY_TZ
  if(!user?.lastActivityAt && user?.createdDate) {
    const created = moment.tz(user.createdDate, 'YYYY-MM-DD', COMPANY_TZ).startOf('day');
    return created.toISOString();
  }

  //3) if no createdDate -> endDate will be set as passed
  if(user?.endDate) {
    return moment(user.endDate).toISOString();
  }

  // optional: if lastActivityAt is present, use that
  if(user?.lastActivityAt) {
    return moment(user.lastActivityAt).toISOString();
  }

  // if everything is missing, fall back to current date
  return moment().tz(COMPANY_TZ).toISOString();
}

export const buildUpdatedUserLifecycleDetails = (user, payload) => {
  const {action, endDate, reactivationDate} = payload;
  switch (action) {
    case UserStatusOperations.ACTIVATE:
      return {
        ...user,
        isActive: true,
        inactiveReason: null,
        endDate: null,
        reactivationDate: null,
      };

    case UserStatusOperations.DEACTIVATE: {
      const resolvedEndDate = resolveEndDate(user);
      return {
        ...user,
        isActive: false,
        inactiveReason: InactiveReason.SEPARATED,
        endDate: resolvedEndDate
      };
    }

    case UserStatusOperations.SCHEDULE_DEACTIVATION:
      return {
        ...user,
        isActive: true,
        inactiveReason: InactiveReason.SCHEDULED_SEPARATION,
        endDate: endDate || user.endDate,
      };

    case UserStatusOperations.PAUSE:
      return {
        ...user,
        isActive: false,
        inactiveReason: InactiveReason.PAUSED,
        reactivationDate: reactivationDate || user.reactivationDate,
        endDate: null,
      };

    default:
      return user;
  }
};

const buildBackendPayload = (userDetails, action) => {
  console.log('Building backend payload with:', { userDetails, action });
  switch (action){
    case UserStatusOperations.ACTIVATE:
      return {
        action: action,
        status: UserStatus.Active,
        endDate: null,
      };
    case UserStatusOperations.DEACTIVATE:
      return {
        action: action,
        status: UserStatus.Inactive,
        endDate: userDetails.endDate,
      };
    case UserStatusOperations.SCHEDULE_DEACTIVATION:
      return {
        action: action,
        endDate: userDetails.endDate,
      };
    case UserStatusOperations.PAUSE:
      return {
        action: action,
        reactivationDate: userDetails.reactivationDate
      };
    default:
      throw new Error(`Unknown lifecycle action: ${action}`);
  }
};

export const updateUserLifecycle = (updatedUser, payload) => {
  return async dispatch => {
    dispatch(userProfileUpdateAction(updatedUser));

    const backendPayload = buildBackendPayload(updatedUser, payload.action);
    try {
      // console.log('Sending PATCH request to update user lifecycle');
      await axios.patch(ENDPOINTS.USER_PROFILE(updatedUser._id), backendPayload);

    } catch (error) {
      toast.error('Error updating user lifecycle:', error);
      dispatch(userProfileUpdateAction(payload.originalUser));
      throw error;
    }
  };
}

/**
 * Update the rehireable status of a user
 * @param{*} user - the user whose rehireable status is to be updated
 * @param{boolean} isRehireable - the new rehireable status
 */
export const updateRehireableStatus = (user, isRehireable) => {
  return async dispatch => {
    const userProfile = { ...user, isRehireable };
    const requestData = { isRehireable };

    await axios.patch(ENDPOINTS.UPDATE_REHIREABLE_STATUS(user._id), requestData);
    dispatch(userProfileUpdateAction(userProfile));
  };
};

/**
 * Switches the visibility of a user
 * @param{*} user - the user whose visibility is to be changed
 * @param{boolean} isVisible - the new visiblity status
 */
export const toggleVisibility = (user, isVisible) => {
  const userProfile = { ...user };
  userProfile.isVisible = isVisible;
  const requestData = { isVisible };

  const toggleVisibilityPromise = axios.patch(ENDPOINTS.TOGGLE_VISIBILITY(user._id), requestData);
  return async dispatch => {
    toggleVisibilityPromise
      .then(() => {
        dispatch(userProfileUpdateAction(userProfile));
      })
      .catch(err => {
        toast.error('failed to toggle visibility: ', err);
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
      .then(() => {
        dispatch(userProfileDeleteAction(user));
      })
      .catch(() => {
        dispatch(userProfileDeleteAction(user));
      });
  };
};

/**
 * update the user final day status
 * @param {*} user - the user to be updated
 * @param {*} finalDate  - the date to be inactive
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

  const updateProfilePromise = axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);
  return async dispatch => {
    updateProfilePromise.then(() => {
      dispatch(userProfileUpdateAction(userProfile));
    });
  };
};

export const updateUserFinalDayStatusIsSet = (user, status, finalDayDate, isSet) => {
  return async dispatch => {
    try {
      // Prepare patch data
      const patchData = {
        status,
        endDate: finalDayDate ? new Date(finalDayDate) : undefined,
        isSet,
      };

      // Make the API request
      const response = await axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);

      // Update the Redux store with the response data
      const updatedUserProfile = {
        ...user,
        ...response.data, // Use the updated data from the API
      };

      dispatch(userProfileUpdateAction(updatedUserProfile));
    } catch (error) {
      toast.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile.');
    }
  };
};


/**
 * fetching all user profiles basic info
 *  Added `source` parameter to identify the calling component.
 */
export const getUserProfileBasicInfo = ({ userId, source } = {}) => {
  // API request to fetch basic user profile information
  let userProfileBasicInfoPromise;
  if (userId)
    userProfileBasicInfoPromise = axios.get(ENDPOINTS.USER_PROFILE(userId));
  else if (source)
    userProfileBasicInfoPromise = axios.get(ENDPOINTS.USER_PROFILE_BASIC_INFO(source));
  else
    userProfileBasicInfoPromise = axios.get(ENDPOINTS.USER_PROFILES);

  return async dispatch => {
    // Dispatch action indicating the start of the fetch process
    await dispatch(userProfilesBasicInfoFetchStartAction());

    return userProfileBasicInfoPromise
      .then(res => {
        // Dispatch action with the fetched basic profile data
        dispatch(userProfilesBasicInfoFetchCompleteACtion(res.data));
        return res.data; // Return the fetched data
      })
      .catch(() => {
        // Dispatch error action if the fetch fails
        dispatch(userProfilesBasicInfoFetchErrorAction());
      });
  };
};

export const enableEditUserInfo = value => dispatch => {
  dispatch({ type: ENABLE_USER_PROFILE_EDIT, payload: value });
};

export const disableEditUserInfo = value => dispatch => {
  dispatch({ type: DISABLE_USER_PROFILE_EDIT, payload: value });
};

export const changePagination = value => dispatch => {
  dispatch({ type: CHANGE_USER_PROFILE_PAGE, payload: value });
};

export const updateUserInfomation = value => dispatch => {
  dispatch({ type: START_USER_INFO_UPDATE, payload: value });
};