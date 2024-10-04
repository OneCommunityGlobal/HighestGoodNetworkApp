import axios from 'axios';
import * as actions from '../constants/weeklySummaries';
import { ENDPOINTS } from '../utils/URL';
import {
  getUserProfileActionCreator,
} from "./userProfile";

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchWeeklySummariesBegin = () => ({
  type: actions.FETCH_WEEKLY_SUMMARIES_BEGIN,
});

/**
 * This action is used to set the weekly summaries in store.
 *
 * @param {array} weeklySummariesData An array of weekly summaries data.
 */
export const fetchWeeklySummariesSuccess = weeklySummariesData => ({
  type: actions.FETCH_WEEKLY_SUMMARIES_SUCCESS,
  payload: { weeklySummariesData },
});

/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */
export const fetchWeeklySummariesError = error => ({
  type: actions.FETCH_WEEKLY_SUMMARIES_ERROR,
  payload: { error },
});

/**
 * Gets the weekly summaries related data for a specific user based on the userId.
 *
 * @param {ObjectId} userId The user id.
 */
export const getWeeklySummaries = userId => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    dispatch(fetchWeeklySummariesBegin());
    dispatch(fetchWeeklySummariesBegin());
    try {
      const response = await axios.get(url);
      const { weeklySummariesCount, weeklySummaries, mediaUrl, adminLinks } = response.data;
      let summaryDocLink;

      const mediaFolderLink = adminLinks.find(link => link.Name === 'Media Folder');
      if (mediaFolderLink) {
        summaryDocLink = mediaFolderLink.Link;
      }
      dispatch(fetchWeeklySummariesSuccess({ weeklySummariesCount, weeklySummaries, mediaUrl:summaryDocLink || mediaUrl}));
      dispatch(getUserProfileActionCreator(response.data));
      return response.status;
    } catch (error) {
      dispatch(fetchWeeklySummariesError(error));
      return error.response.status;
    }
  };
};

/**
 * Update the userProfile with the latest weekly summaries data.
 *
 * @param {String} userId The user id.
 * @param {Object} weeklySummariesData The weekly summary related data.
 */
export const updateWeeklySummaries = (userId, weeklySummariesData) => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async (dispatch) => {
    try {
      // Get the user's profile from the server.
      const response = await axios.get(url);
      const userProfile = await response.data;
      const adminLinks = userProfile.adminLinks || [];

      // Merge the weekly summaries related changes with the user's profile.
      const {mediaUrl, weeklySummaries, weeklySummariesCount } = weeklySummariesData;
      
      // update the changes on weekly summaries link into admin links
      const mediaFolderLink = adminLinks.find(link => link.Name === 'Media Folder');
      if (mediaFolderLink) {
        mediaFolderLink.Link = mediaUrl;
      } else if (mediaUrl) {
        adminLinks.push({ Name: 'Media Folder', Link: mediaUrl });
      }

      const userProfileUpdated = {
        ...userProfile,
        adminLinks,
        mediaUrl,
        weeklySummaries,
        weeklySummariesCount,
      };

      // Update the user's profile on the server.
      const updateResponse = await axios.put(url, userProfileUpdated);
      if (updateResponse.status === 200) {
        dispatch(getUserProfileActionCreator(userProfileUpdated));
      }
      return updateResponse.status;
    } catch (error) {
      return error.response ? error.response.status : 500;
    }
  };
};
