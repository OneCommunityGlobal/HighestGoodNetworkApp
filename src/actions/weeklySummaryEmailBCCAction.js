import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import * as types from '../constants/WeeklySummaryEmailBccConstants';
// import { toast } from 'react-toastify';

// action creators
const getAllWeeklySummaryEmailBccs = allAssignments => ({
  type: types.GET_WEEKLY_SUMMARY_EMAIL_ASSIGNMENTS,
  payload: allAssignments,
});

const setWeeklySummaryEmailBcc = emailAssignment => ({
  type: types.SET_WEEKLY_SUMMARY_EMAIL_ASSIGNMENT,
  payload: emailAssignment,
});

const deleteWeeklySummaryEmailBcc = id => ({
  type: types.DELETE_WEEKLY_SUMMARY_EMAIL_ASSIGNMENT,
  payload: id,
});

const weeklySummaryEmailBccError = error => ({
  type: types.WEEKLY_SUMMARY_EMAIL_ASSIGNMENT_ERROR,
  payload: error,
});

// fetch all assignments
export const getAllWeeklySummaryEmailAssignments = () => {
  const url = ENDPOINTS.WEEKLY_SUMMARY_EMAIL_BCC();
  return async dispatch => {
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        dispatch(getAllWeeklySummaryEmailBccs(response.data));
      } else {
        dispatch(weeklySummaryEmailBccError(response.data));
      }
    } catch (err) {
      dispatch(weeklySummaryEmailBccError(err));
    }
  };
};

// set a new assignment
export const setWeeklySummaryEmailAssignment = email => {
  const url = ENDPOINTS.WEEKLY_SUMMARY_EMAIL_BCC();
  return async dispatch => {
    try {
      const response = await axios.post(url, { email });
      if (response.status === 200) {
        dispatch(setWeeklySummaryEmailBcc(response.data));
      } else {
        dispatch(weeklySummaryEmailBccError(response.data));
      }
    } catch (err) {
      dispatch(weeklySummaryEmailBccError(err));
    }
  };
};

// delete assignment
export const deleteWeeklySummaryEmailAssignment = id => {
  const url = ENDPOINTS.DELETE_WEEKLY_SUMMARY_EMAIL_BCC(id);
  return async dispatch => {
    try {
      const response = await axios.delete(url);
      if (response.status === 200) {
        dispatch(deleteWeeklySummaryEmailBcc(response.data.id));
      } else {
        dispatch(weeklySummaryEmailBccError(response.data));
      }
    } catch (err) {
      dispatch(weeklySummaryEmailBccError(err));
    }
  };
};

export const updateWeeklySummaryEmailAssignment = (id, email) => async dispatch => {
  try {
    const response = await axios.put(ENDPOINTS.UPDATE_WEEKLY_SUMMARY_EMAIL_BCC(id), { email });
    if (response.status === 200) {
      dispatch(getAllWeeklySummaryEmailAssignments());
    } else {
      dispatch(weeklySummaryEmailBccError(response.data));
    }
  } catch (error) {
    dispatch(weeklySummaryEmailBccError(error));
  }
};
