import axios from 'axios';
import * as actions from '../constants/weeklySummaries';
import { ENDPOINTS } from '~/utils/URL';
import { getUserProfileActionCreator } from './userProfile';

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
    try {
      const response = await axios.get(url);
      const { weeklySummariesCount, weeklySummaries, mediaUrl, adminLinks } = response.data;

      const foundMediaFolderLink = Array.isArray(adminLinks)
        ? adminLinks.find(link => link.Name === 'Media Folder')
        : null;

      const summaryDocLink = foundMediaFolderLink?.Link;

      dispatch(
        fetchWeeklySummariesSuccess({
          weeklySummariesCount,
          weeklySummaries,
          mediaUrl: summaryDocLink || mediaUrl,
        }),
      );
      dispatch(getUserProfileActionCreator(response.data));
      return response.status;
    } catch (error) {
      dispatch(fetchWeeklySummariesError(error));
      return error.response?.status || 500;
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
  return async dispatch => {
    try {
      let response = await axios.get(url);
      const userProfile = response.data;
      const adminLinks = userProfile.adminLinks || [];

      const { mediaUrl, weeklySummaries, weeklySummariesCount } = weeklySummariesData;

      let doesMediaFolderExist = false;
      const updatedAdminLinks = adminLinks.map(link => {
        if (link.Name === 'Media Folder') {
          doesMediaFolderExist = true;
          return { ...link, Link: mediaUrl };
        }
        return link;
      });

      if (!doesMediaFolderExist && mediaUrl) {
        updatedAdminLinks.push({ Name: 'Media Folder', Link: mediaUrl });
      }

      const userProfileUpdated = {
        ...userProfile,
        adminLinks: updatedAdminLinks,
        mediaUrl,
        weeklySummaries,
        weeklySummariesCount,
      };

      response = await axios.put(url, userProfileUpdated);
      if (response.status === 200) {
        await dispatch(getUserProfileActionCreator(userProfileUpdated));
      }
      return response.status;
    } catch (error) {
      return error.response?.status || 500;
    }
  };
};
