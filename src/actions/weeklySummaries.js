import axios from 'axios';
import * as actions from '../constants/weeklySummaries';
import { ENDPOINTS } from '../utils/URL';
import { filter } from 'lodash';
import { strip } from 'joi/lib/types/lazy';
import {
  getUserProfile as getUserProfileActionCreator,
} from '../constants/userProfile';


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
      let summaryDocLink;
      for (const link in adminLinks) {
        if (adminLinks[link].Name === 'Media Folder') {
          summaryDocLink = adminLinks[link].Link;
          break; 
        }
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
  return async () => {
    try {
      // Get the user's profile from the server.
      let response = await axios.get(url);
      const userProfile = await response.data;

      // Merge the weekly summaries related changes with the user's profile.
      const {mediaUrl, weeklySummaries, weeklySummariesCount } = weeklySummariesData;
      console.log('respon get', response.data)
      // update the changes on weekly summaries link into admin links
      let doesMediaFolderExist = false;
      for (const link of adminLinks) {
        if (link.Name === 'Media Folder') {
          link.Link = mediaUrl;
          doesMediaFolderExist = true;
          break; 
        }
      }
      if(!doesMediaFolderExist && mediaUrl){
        adminLinks.push(
          {Name:'Media Folder',Link:mediaUrl}
        )
      }
      const userProfileUpdated = {
        ...userProfile,
        mediaUrl,
        weeklySummaries,
        weeklySummariesCount,
      };

      // Update the user's profile on the server.
      let updateResponse = await axios.put(url, userProfileUpdated);
      return updateResponse.status;
    } 
    catch (error) {
  if (error.response) {
    return error.response.status;
  } else {
    return 404; 
  }
}
  };
};

export const extractWeeklySummaries = userIds => {
  return async (dispatch, getState) => {
    try {
      const summarydata = getState().weeklySummariesReport;
      const summaryreports = summarydata.summaries;
      const filteredmembers = summaryreports.filter(member => userIds.includes(member._id));
      // console.log("filteredMembers: ", filteredmembers)
      
      const filteredSummaries = filteredmembers.map((member) => ({
        _id: member._id,
        report: member.weeklySummaries[0]?.summary ?? "No summary available",
      }));
      
      // console.log (
      //   "filterdsummaries", filteredSummaries);
      const strippedSummaries = filteredSummaries.map(member => ({
        _id: member._id,
        report: member.report.replace(/<\/?p>/g, ''),
      }));

      return { finallist: strippedSummaries };
    } catch (err) {
      console.error('extractWeeklySummaries:', err);
      return null;
    }
  };
};
