import axios from 'axios';
import * as actions from '../constants/weeklySummaries';
import { ENDPOINTS } from '../utils/URL';

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
      // Only pick the fields related to weekly summaries from the userProfile.
      const { weeklySummariesCount, weeklySummaries, mediaUrl, adminLinks } = response.data;
      let googleDocLink;
      for (let link in adminLinks) {
        if (adminLinks[link].Name === "Weekly Summaries Link") {
          googleDocLink = adminLinks[link].Link;
          break; 
        }
      }
      dispatch(fetchWeeklySummariesSuccess({ weeklySummariesCount, weeklySummaries, mediaUrl:googleDocLink || mediaUrl}));
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
  return async () => {
    try {
      // Get the user's profile from the server.
      let response = await axios.get(url);
      const userProfile = await response.data;
      const adminLinks = userProfile.adminLinks || [];

      // Merge the weekly summaries related changes with the user's profile.
      const { mediaUrl, weeklySummaries, weeklySummariesCount } = weeklySummariesData;
      // update the changes on weekly summaries link into admin links
      for (let link of adminLinks) {
        if (link.Name === "Weekly Summaries Link") {
          link.Link = mediaUrl;
          break; 
        }
      }
      const userProfileUpdated = {
        ...userProfile,
        adminLinks,
        mediaUrl,
        weeklySummaries,
        weeklySummariesCount,
      };

      // Update the user's profile on the server.
      response = await axios.put(url, userProfileUpdated);
      return response.status;
    } catch (error) {
      return error.response.status;
    }
  };
};
