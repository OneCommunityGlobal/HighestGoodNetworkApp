import axios from 'axios';
import moment from 'moment';
import { ENDPOINTS } from '~/utils/URL';
import { GET_ERRORS } from '../../constants/errors';
import {
  START_TIME_LOG,
  PAUSE_TIME_LOG,
  STOP_TIME_LOG,
  GET_CURRENT_TIME_LOG,
  GET_ALL_PROJECT_TIME_LOGS,
} from '../../constants/bmdashboard/timeLoggerConstants';

// Start Time Log Action
export const startTimeLog = (projectId, memberId, task) => {
  return async dispatch => {
    try {
      const response = await axios.post(ENDPOINTS.TIME_LOGGER_START(projectId, memberId), {
        task,
      });

      dispatch({
        type: START_TIME_LOG,
        payload: { ...response.data.timeLog, memberId, projectId },
      });
    } catch (error) {
      dispatch({
        type: GET_ERRORS,
        payload: error.response ? error.response.data : { message: 'Error starting time log' },
      });
    }
  };
};

// Pause Time Log Action
export const pauseTimeLog = (projectId, timeLogId, memberId) => {
  return async dispatch => {
    try {
      const response = await axios.post(ENDPOINTS.TIME_LOGGER_PAUSE(projectId, memberId), {
        timeLogId,
      });

      dispatch({
        type: PAUSE_TIME_LOG,
        payload: { ...response.data.timeLog, memberId, projectId },
      });
    } catch (error) {
      dispatch({
        type: GET_ERRORS,
        payload: error.response ? error.response.data : { message: 'Error pausing time log' },
      });
    }
  };
};

// Stop Time Log Action
export const stopTimeLog = (projectId, timeLogId, memberId) => {
  return async dispatch => {
    try {
      const response = await axios.post(ENDPOINTS.TIME_LOGGER_STOP(projectId, memberId), {
        timeLogId,
      });

      dispatch({
        type: STOP_TIME_LOG,
        payload: { ...response.data.timeLog, memberId, projectId },
      });

      // Refresh all project time logs after stopping to update the summary
      // Small delay to ensure the completed log is saved and queryable
      setTimeout(() => {
        dispatch(getAllProjectTimeLogs(projectId));
      }, 300);
    } catch (error) {
      dispatch({
        type: GET_ERRORS,
        payload: error.response ? error.response.data : { message: 'Error stopping time log' },
      });
    }
  };
};

// Get Current Time Log Action
export const getCurrentTimeLog = (projectId, memberId) => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.TIME_LOGGER_LOGS(projectId, memberId));

      // Find the ongoing or paused time log, but only if it's from today
      const today = moment().startOf('day');
      const currentTimeLog = response.data.find(
        log =>
          (log.status === 'ongoing' || log.status === 'paused') &&
          moment(log.createdAt).isSameOrAfter(today),
      );

      dispatch({
        type: GET_CURRENT_TIME_LOG,
        payload: { currentTimeLog: currentTimeLog || null, memberId, projectId },
      });
    } catch (error) {
      dispatch({
        type: GET_ERRORS,
        payload: error.response
          ? error.response.data
          : { message: 'Error fetching current time log' },
      });
    }
  };
};

// Get All Project Time Logs Action
export const getAllProjectTimeLogs = projectId => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.TIME_LOGGER_ALL_LOGS(projectId));


      dispatch({
        type: GET_ALL_PROJECT_TIME_LOGS,
        payload: { timeLogs: response.data, projectId },
      });
    } catch (error) {
      console.error('Error fetching project time logs:', error);
      dispatch({
        type: GET_ERRORS,
        payload: error.response
          ? error.response.data
          : { message: 'Error fetching project time logs' },
      });
    }
  };
};
