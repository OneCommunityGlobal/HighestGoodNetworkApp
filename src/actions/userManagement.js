import axios from 'axios';
import moment from 'moment';
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
  FINISH_USER_INFO_UPDATE,
  ERROR_USER_INFO_UPDATE,
} from '../constants/userManagement';
import { ENDPOINTS } from '../utils/URL';
import { UserStatus } from '../utils/enums';
import { getTimeEndDateEntriesByPeriod, getTimeStartDateEntriesByPeriod } from './timeEntries';

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
  const userProfile = { ...user };
  userProfile.isActive = status === UserStatus.Active;
  userProfile.reactivationDate = reactivationDate;
  const patchData = { status, reactivationDate };
  return async dispatch => {
    // Optimistic update
    dispatch(userProfileUpdateAction(userProfile));

    try {
      if (status === UserStatus.InActive) {
        // Check for the last week of work
        const lastEnddate = await dispatch(
          getTimeEndDateEntriesByPeriod(user._id, user.createdDate, userProfile.toDate),
        );
        if (lastEnddate !== 'N/A') {
          //if work exists, set EndDate to that week
          patchData.endDate = moment(lastEnddate).format('YYYY-MM-DDTHH:mm:ss');
          userProfile.endDate = moment(lastEnddate).format('YYYY-MM-DDTHH:mm:ss');
        } else {
          //No work exists, set end date to start date
          patchData.endDate = moment(user.createdDate);
          userProfile.endDate = moment(user.createdDate);
        }
      } else {
        // User is active
        patchData.endDate = undefined;
        userProfile.endDate = undefined;
      }

      // Perform the API call
      await axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData);

      // Ensure the dispatched action is final (optional if optimistic update is sufficient)
      dispatch(userProfileUpdateAction(userProfile));
    } catch (error) {
      console.error('Error updating user status:', error);

      // Rollback to previous state on error
      dispatch(userProfileUpdateAction(user));
    }
  };
};

/**
 * Update the rehireable status of a user
 * @param{*} user - the user whose rehireable status is to be updated
 * @param{boolean} isRehireable - the new rehireable status
 */
export const updateRehireableStatus = (user, isRehireable) => {
  return async dispatch => {
    const userProfile = { ...user, isRehireable };
    const requestData = { isRehireable };
    try {
      await axios.patch(ENDPOINTS.UPDATE_REHIREABLE_STATUS(user._id), requestData);
      dispatch(userProfileUpdateAction(userProfile));
    } catch (err) {
      throw err;
    }
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
      .then(res => {
        dispatch(userProfileUpdateAction(userProfile));
      })
      .catch(err => {
        console.error('failed to toggle visibility: ', err);
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
    updateProfilePromise.then(res => {
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
        endDate: finalDayDate ? moment(finalDayDate).add(1, 'days').format('YYYY-MM-DD') : undefined,
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
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile.');
    }
  };
};

/**
 * fetching all user profiles basic info
 */
export const getUserProfileBasicInfo = () => {
  // API request to fetch basic user profile information
  const userProfileBasicInfoPromise = axios.get(ENDPOINTS.USER_PROFILE_BASIC_INFO);

  return async dispatch => {
    // Dispatch action indicating the start of the fetch process
    await dispatch(userProfilesBasicInfoFetchStartAction());

    return userProfileBasicInfoPromise
      .then(res => {
        // Dispatch action with the fetched basic profile data
        dispatch(userProfilesBasicInfoFetchCompleteACtion(res.data));
        return res.data; // Return the fetched data
      })
      .catch(err => {
        // Dispatch error action if the fetch fails
        dispatch(userProfilesBasicInfoFetchErrorAction());
      });
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
 * Error when fetching the user profils basic info
 * @param payload : error status code
 */
export const userProfilesBasicInfoFetchErrorAction = payload => {
  return {
    type: FETCH_USER_PROFILE_BASIC_INFO_ERROR,
    payload,
  };
};

export const enableEditUserInfo = value => (dispatch, getState) => {
  dispatch({ type: ENABLE_USER_PROFILE_EDIT, payload: value });
};

export const disableEditUserInfo = value => (dispatch, getState) => {
  dispatch({ type: DISABLE_USER_PROFILE_EDIT, payload: value });
};

export const changePagination = value => (dispatch, getState) => {
  dispatch({ type: CHANGE_USER_PROFILE_PAGE, payload: value });
};

export const updateUserInfomation = value => (dispatch, getState) => {
  dispatch({ type: START_USER_INFO_UPDATE, payload: value });
};

// export const updateUserInformation=(value)=>async(dispatch,getState)=>{
//   try {
//     dispatch({type:START_USER_INFO_UPDATE})
//     var response=await axios.patch(ENDPOINTS.USER_PROFILE_UPDATE,value);
//     const {data} = await axios.get(ENDPOINTS.USER_PROFILES);
//     dispatch({type:FINISH_USER_INFO_UPDATE,payload:data})
//   } catch (error) {
//     console.log(error)
//     dispatch({type:ERROR_USER_INFO_UPDATE})
//   }
// }
