import axios from 'axios';
import moment from 'moment';
import { GET_TIME_ENTRIES_WEEK, GET_TIME_ENTRIES_PERIOD } from '../constants/timeEntries';
import { ENDPOINTS } from '../utils/URL';

/**
 * number === 0 current week
 * number === 1 last week
 * number === 2 week before last
 */
export const getTimeEntriesForWeek = (userId, offset) => {
  //TODO: Environment variable for server timezone

  const fromDate = moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DD');

  const toDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DD');

  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
  return async dispatch => {
    let loggedOut = false;
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
        //logout error
        loggedOut = true;
      }
    });
    if (!loggedOut || !res || !res.data) {
      await dispatch(setTimeEntriesForWeek(res.data, offset));
    }
  };
};

export const getTimeEntriesForPeriod = (userId, fromDate, toDate) => {
  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
  return async dispatch => {
    let loggedOut = false;
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
        //logout error
        loggedOut = true;
      }
    });
    if (!loggedOut || !res || !res.data) {
      await dispatch(setTimeEntriesForPeriod(res.data));
    }
  };
};

export const postTimeEntry = timeEntry => {
  const url = ENDPOINTS.TIME_ENTRY();
  return async dispatch => {
    try {
      const res = await axios.post(url, timeEntry);
      dispatch(updateTimeEntries(timeEntry));
      return res.status;
    } catch (e) {
      return e.response.status;
    }
  };
};

export const editTimeEntry = (timeEntryId, timeEntry, oldDateOfWork) => {
  const url = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntryId);
  return async dispatch => {
    try {
      const res = await axios.put(url, timeEntry);
      dispatch(updateTimeEntries(timeEntry, oldDateOfWork));
      return res.status;
    } catch (e) {
      return e.response.status;
    }
  };
};

export const deleteTimeEntry = timeEntry => {
  const url = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntry._id);
  return async dispatch => {
    try {
      const res = await axios.delete(url);
      dispatch(updateTimeEntries(timeEntry));
      return res.status;
    } catch (e) {
      return e.response.status;
    }
  };
};

const updateTimeEntries = (timeEntry, oldDateOfWork) => {
  const startOfWeek = moment().startOf('week');

  return async dispatch => {
    if (oldDateOfWork) {
      const oldOffset = Math.ceil(startOfWeek.diff(oldDateOfWork, 'week', true));
      dispatch(getTimeEntriesForWeek(timeEntry.personId, oldOffset));
    }

    const offset = Math.ceil(startOfWeek.diff(timeEntry.dateOfWork, 'week', true));

    if (offset <= 2 && offset >= 0) {
      dispatch(getTimeEntriesForWeek(timeEntry.personId, offset));
    }
  };
};

export const setTimeEntriesForWeek = (data, offset) => ({
  type: GET_TIME_ENTRIES_WEEK,
  payload: data,
  offset,
});

export const setTimeEntriesForPeriod = data => ({
  type: GET_TIME_ENTRIES_PERIOD,
  payload: data,
});
