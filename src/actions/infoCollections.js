import axios from 'axios';
import * as actions from '../constants/infoCollections';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchInfosBegin = () => ({
  type: actions.FETCH_INFOS_BEGIN,
});

/**
 * This action is used to set the weekly summaries in store.
 *
 * @param {array} infoCollectionsData An array of weekly summaries data.
 */
export const fetchInfosSuccess = infoCollectionsData => ({
  type: actions.FETCH_INFOS_SUCCESS,
  payload: { infoCollectionsData },
});
/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */

export const fetchInfosError = error => ({
  type: actions.FETCH_INFOS_ERROR,
  payload: { error },
});

/**
 * Gets the weekly summaries related data for a specific user based on the userId.
 *
 * @param {ObjectId} userId The user id.
 */
export const getInfos = userId => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    dispatch(fetchInfosBegin());
    try {
      const response = await axios.get(url);
      const {infoCollections} = response.data;
      dispatch(fetchInfosSuccess({infoCollections}));
      return response.status;
    } catch (error) {
      dispatch(fetchInfosError(error));
      return error.response.status;
    }
  };
};

/**
 * Update the userProfile with the latest weekly summaries data.
 *
 * @param {String} userId The user id.
 * @param {Object} infoCollectionsData The weekly summary related data.
 */

export const updateInfos = (userId, infoCollectionsData) => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    try {
      let response = await axios.get(url);
      const userProfile = response.data;
      const{infoCollections}=infoCollectionsData;
      const userProfileUpdated = {
        ...userProfile,
        infoCollections,
      };
      response = await axios.put(url, userProfileUpdated);
      return response.status;
    } catch (error) {
      return error.response.status;
    }
  };
};

/**
 * Set all users to have the same infoCollections data.
 *
 * @param {Object} infoCollectionsData The new infoCollections data.
 */

export const setAllUsersInfos = (infoCollectionsData) => {
  const usersUrl = ENDPOINTS.USERS;
  return async dispatch => {
    try {
      // Get all users
      const usersResponse = await axios.get(usersUrl);
      const users = usersResponse.data;
      // Update each user's infoCollections
      for (let user of users) {
        const userUrl = ENDPOINTS.USER_PROFILE(user.id);
        const userProfileUpdated = {
          ...user,
          infoCollections: infoCollectionsData,
        };
        
        await axios.put(userUrl, userProfileUpdated);
      }

      return usersResponse.status;
    } catch (error) {
      return error.response.status;
    }
  };
};

