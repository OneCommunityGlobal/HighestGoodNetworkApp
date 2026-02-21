import axios from 'axios';
import { toast } from 'react-toastify';
import * as actions from '../constants/weeklySummaries';
import * as reportActions from '../constants/weeklySummariesReport';
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
  const url = ENDPOINTS.USER_PROFILE_FIXED(userId);
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

// ========== WEEKLY SUMMARIES REPORT (from your old file) ==========

/**
 * Action to set the 'loading' flag to true for reports.
 */
export const fetchWeeklySummariesReportBegin = () => ({
  type: reportActions.FETCH_SUMMARIES_REPORT_BEGIN,
});

/**
 * This action is used to set the weekly summaries reports in store.
 *
 * @param {array} weeklySummariesData An array of all active users.
 */
export const fetchWeeklySummariesReportSuccess = weeklySummariesData => ({
  type: reportActions.FETCH_SUMMARIES_REPORT_SUCCESS,
  payload: { weeklySummariesData },
});

/**
 * Handle the error case for reports.
 *
 * @param {Object} error The error object.
 */
export const fetchWeeklySummariesReportError = error => ({
  type: reportActions.FETCH_SUMMARIES_REPORT_ERROR,
  payload: { error },
});

/**
 * Update one summary report
 *
 * @param {Object} updatedField the updated field object, dynamic
 */
export const updateSummaryReport = ({ _id, updatedField }) => ({
  type: reportActions.UPDATE_SUMMARY_REPORT,
  payload: { _id, updatedField },
});

// write server-truth user object into the store
export const updateSummaryReportFromServerAction = (user) => ({
  type: reportActions.UPDATE_SUMMARY_REPORT,
  payload: { _id: user._id, updatedField: user },
});
/**
 * Gets all active users' summaries + a few other selected fields from the userProfile that
 * might be useful for the weekly summary report.
 */
export const getWeeklySummariesReport = (weekIndex = null) => {
  return async dispatch => {
    dispatch(fetchWeeklySummariesReportBegin());
    try {
      // Use the APIEndpoint from ENDPOINTS
      let url = ENDPOINTS.WEEKLY_SUMMARIES_REPORT();
      
      const timestamp = `ts=${Date.now()}`;
      const separator = url.includes('?') ? '&' : '?';

      if (weekIndex === null) {
        url = `${url}${separator}${timestamp}`;
      } else {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}week=${weekIndex}&${timestamp}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
      // Adding this debug log to check if filterColors are coming back
      // eslint-disable-next-line no-console
      console.log('API Response:', response.data);
      // eslint-disable-next-line no-console
      console.log('FilterColors in response:', response.data.map(user => ({
      id: user._id,
      name: user.firstName + ' ' + user.lastName,
      filterColor: user.filterColor
    })));
      dispatch(fetchWeeklySummariesReportSuccess(response.data));
      return { status: response.status, data: response.data };
    } catch (error) {
      dispatch(fetchWeeklySummariesReportError(error));
      return error.response ? error.response.status : 500;
    }
  };
};

// working
// export const updateOneSummaryReport = (userId, fullUserPayload) => {
//   // const url = ENDPOINTS.USER_PROFILE(userId);
//   // return async dispatch => {
//   //   const { data: userProfile } = await axios.get(url);
//   //   const payload = { ...userProfile, ...updatedField };
//   //   // eslint-disable-next-line no-console
//   //   console.log('🛰 PUT payload being sent:', payload);
//   //   const res = await axios.put(url, {
//   //     ...userProfile,
//   //     ...updatedField,
//   //   });

//   //   // 🔹 Step 4 debug: log backend response explicitly
//   //   // eslint-disable-next-line no-console
//   //   console.log('🔍 Backend returned after PUT:', res.data);
//   //   // eslint-disable-next-line no-console
//   //   console.log('✅ PUT response:', res.data);

//   //   if (res.status === 200) {
//   //     dispatch(updateSummaryReport({ _id: userId, updatedField }));
//   //     // eslint-disable-next-line no-console
//   //     console.log('🟢 Redux state updated with:', updatedField);
//   //     return res;
//   //   }

//   //   throw new Error(`An error occurred while attempting to save the changes to the profile.`);
//   // };
//   const url = ENDPOINTS.USER_PROFILE(userId);
//   return async dispatch => {
//     // try {
//     //   // Optional: fetch current user profile if needed
//     //   // const { data: userProfile } = await axios.get(url);
//     //   const state = getState();
//     //   const allUsers = Array.isArray(state.weeklySummariesReport?.summaries)
//     //     ? state.weeklySummariesReport.summaries
//     //     : [];
//     //   const currentUser = allUsers.find(u => u._id === userId);

//     //   if (!currentUser) throw new Error('User not found in state');

//     //   // Merge updatedField (like filterColor) into the full user object
//     //   const payload = { ...currentUser, ...updatedField };

//     //   // Send the PUT and get server response (server should return the saved user)
//     //   // const res = await axios.put(url, {
//     //   //   ...updatedField, // send only updated fields (you already normalized on client)
//     //   // });
//     //   const res = await axios.put(url, payload);
//     //   // Log for debugging
//     //   // eslint-disable-next-line no-console
//     //   console.log('✅ PUT response (updateOneSummaryReport):', res.data);

//     //   if (res.status === 200) {
//     //     // Dispatch the server-truth into the store.
//     //     // IMPORTANT: payload should be the full user object (or at least fields the UI needs)
//     //     dispatch(updateSummaryReport({ _id: userId, updatedField: res.data }));

//     //     // Return the server response so callers can use res.data
//     //     return res;
//     //   }

//     //   throw new Error('Failed to save profile');
//     // } catch (err) {
//     //   // rethrow so caller's try/catch can handle revert
//     //   throw err;
//     // }
//     //above was good byt not working code
//     const res = await axios.put(url, fullUserPayload);
//     if (res.status === 200) {
//       dispatch(updateSummaryReport({ _id: userId, updatedField: res.data }));
//       return res;
//     }
//     throw new Error('Failed to save profile');
//   };
// };
export const updateOneSummaryReport = (userId, payload) => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    const res = await axios.put(url, payload); 
    if (res.status === 200) {
      dispatch(updateSummaryReport({ _id: userId, updatedField: res.data }));
      return res;
    }
    throw new Error('Failed to save profile');
  };
};

/**
 * Toggle the user's bio status (posted, requested, default).
 */
export const toggleUserBio = (userId, bioPosted) => {
  const url = ENDPOINTS.TOGGLE_BIO_STATUS(userId);
  return async dispatch => {
    try {
      const res = await axios.patch(url, { bioPosted });

      if (res.status === 200) {
        const updatedField = { bioPosted };

        // Dispatch an action to update the store
        dispatch(updateSummaryReport({ _id: userId, updatedField }));

        toast.success(`Bio status updated to "${bioPosted}"`);
      }

      return res;
    } catch (error) {
      toast.error('An error occurred while updating bio status.');
      throw error;
    }
  };
};

/**
 * Optimistically update filterColor for all users in selected team codes.
 */
export const updateBulkFilterColors = ({ color, teamCodes, newState }) => ({
  type: reportActions.UPDATE_BULK_FILTER_COLORS,
  payload: { color, teamCodes, newState },
});