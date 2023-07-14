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
export const fetchWeeklySummariesSuccess = infoCollectionsData => ({
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
      // Only pick the fields related to weekly summaries from the userProfile.
      const {infoCollections} = response.data;
      dispatch(fetchInfosSuccess({ infoCollections}));
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
  return async () => {
    try {
      // Get the user's profile from the server.
      let response = await axios.get(url);
      const userProfile = await response.data;
      // Merge the weekly summaries related changes with the user's profile.
      const { infoCollections} = infoCollectionsData;
      // update the changes on weekly summaries link into admin links
      // for (let link of adminLinks) {
      //   if (link.Name === 'Dropbox Link') {
      //     link.Link = mediaUrl;
      //     break; 
      //   }
      // }
      const userProfileUpdated = {
        ...userProfile,
        infoCollections,
      };

      // Update the user's profile on the server.
      response = await axios.put(url, userProfileUpdated);
      return response.status;
    } catch (error) {
      return error.response.status;
    }
  };
};
