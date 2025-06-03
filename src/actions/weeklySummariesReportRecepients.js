import * as actions from '../constants/weeklySummariesReport';
import { ENDPOINTS } from '../utils/URL';
import axios from 'axios';

export const authorizeWeeklySummaries = (message) => ({
  type: actions.AUTHORIZE_WEEKLY_SUMMARY_REPORTS,
  payload: message
})

export const authorizeWeeklySummariesReportError = (errorMsg) => ({
  type: actions.AUTHORIZE_WEEKLYSUMMARIES_REPORTS_ERROR,
  payload: errorMsg
})

// export const saveWeeklySummary = (message) => ({
//   type: actions.SAVE_WEEKLY_SUMMARIES_RECIPIENTS,
//   payload: message
// })

export const getRecepients = (recepientsArr) => ({
  type: actions.GET_SUMMARY_RECIPIENTS,
  recepientsArr
})

export const getRecepientsError = (err) => ({
  type: actions.GET_SUMMARY_RECIPIENTS_ERROR,
  payload: err
})

export const addSummaryRecipient = (userid) => {
  const url = ENDPOINTS.SAVE_SUMMARY_RECEPIENTS(userid);
  return async dispatch => {
    try {
      const response = await axios.patch(url);
      // dispatch(saveWeeklySummary(response.data.message));
      return response.status;
    } catch (error) {
      console.log("response for Error:", error)
      dispatch(authorizeWeeklySummariesReportError(error));
      // return error.response.status;
    }
  };
}

export const deleteRecipient = (userid) => ({
  type: actions.DELETE_WEEKLY_SUMMARIES_RECIPIENTS,
  payload: {userid}
})

export const deleteSummaryRecipient = (userid) => {
  const url = ENDPOINTS.SAVE_SUMMARY_RECEPIENTS(userid);
  return async dispatch => {
    try {
      const response = await axios.delete(url);
      dispatch(deleteRecipient(userid));
      return response.status;
    } catch (error) {
      console.log("response for Error:", error)
      dispatch(authorizeWeeklySummariesReportError(error));
      // return error.response.status;
    }
  };
}

export const getSummaryRecipients = () => {
  const url = ENDPOINTS.GET_SUMMARY_RECEPIENTS();
  return async dispatch => {
    try {
      const response = await axios.get(url);
      dispatch(getRecepients(response.data));
      return response.data;
    } catch (error) {
      console.log("response for Error:", error)
      dispatch(getRecepientsError(error));
      // return error.response.status;
    }
  };
}
