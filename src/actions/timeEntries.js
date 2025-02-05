import axios from 'axios';
import moment from 'moment';
import {
  GET_TIME_ENTRIES_WEEK,
  GET_TIME_ENTRIES_PERIOD,
  GET_TIME_ENTRIES_PERIOD_BULK,
} from '../constants/timeEntries';
import { ENDPOINTS } from '../utils/URL';

/**
 * number === 0 current week
 * number === 1 last week
 * number === 2 week before last
 */
export const getTimeEntriesForWeek = (userId, offset) => {
  // TODO: Environment variable for server timezone

  const fromDate = moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DDTHH:mm:ss');

  const toDate = moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(offset, 'weeks')
    .format('YYYY-MM-DDTHH:mm:ss');

  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
  return async dispatch => {
    let loggedOut = false;
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
        // logout error
        loggedOut = true;
      }
    });
    if (!loggedOut || !res || !res.data) {
      const filteredEntries = res.data.filter(entry => {
        const entryDate = moment(entry.dateOfWork); // Convert the entry date to a moment object
        return entryDate.isBetween(fromDate, toDate, 'day', '[]'); // Check if the entry date is within the range (inclusive)
      });
      await dispatch(setTimeEntriesForWeek(filteredEntries, offset));
      // await dispatch(setTimeEntriesForWeek(res.data, offset));
    }
  };
};

export const getTimeEntriesForPeriod = (userId, fromDate, toDate) => {
  toDate = moment(toDate)
    .endOf('day')
    .format('YYYY-MM-DDTHH:mm:ss');
  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
  return async dispatch => {
    let loggedOut = false;
    const res = await axios.get(url).catch(error => {
      if (error.status === 401) {
        // logout error
        loggedOut = true;
      }
    });
    if (!loggedOut || !res || !res.data) {
      const filteredEntries = res.data.filter(entry => {
        const entryDate = moment(entry.dateOfWork); // Convert the entry date to a moment object
        return entryDate.isBetween(fromDate, toDate, 'day', '[]'); // Check if the entry date is within the range (inclusive)
      });
      filteredEntries.sort((a, b) => {
        return moment(b.dateOfWork).valueOf() - moment(a.dateOfWork).valueOf();
      });

      await dispatch(setTimeEntriesForPeriod(filteredEntries));
      // await dispatch(setTimeEntriesForPeriod(res.data));
    }
  };
};

export const getUsersTotalHoursForSpecifiedPeriod = (userIds, fromDate, toDate) => {
  toDate = moment(toDate)
    .endOf('day')
    .format('YYYY-MM-DDTHH:mm:ss');
  return async dispatch => {
    let loggedOut = false;
    try {
      const res = await axios.post(ENDPOINTS.TIME_ENTRIES_USERS_HOURS_PERIOD, {
        userIds,
        fromDate,
        toDate,
      });
      if (res && res.data) {
        await dispatch(setUsersTotalHoursPeriod(res.data));
        return res.data; // Return the data here
      }
    } catch (error) {
      if (error.response?.status === 401) {
        loggedOut = true;
      }
      console.error('Error fetching total hours:', error);
    }
    return [];
  };
};


export const getTimeEndDateEntriesByPeriod = (userId, fromDate, toDate) => {
  //Find last week of work in date
  toDate = moment(toDate)
    .endOf('day')
    .format('YYYY-MM-DDTHH:mm:ss');
  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
  return async dispatch => {
    let loggedOut = false;
    try {
      const res = await axios.get(url);
      if (!res || !res.data) {
        console.log('Request failed or no data');
        return 'N/A';
      }
      const filteredEntries = res.data.filter(entry => {
        const entryDate = moment(entry.dateOfWork);
        return entryDate.isBetween(fromDate, toDate, 'day', '[]');
      });
      filteredEntries.sort((a, b) => {
        return moment(b.dateOfWork).valueOf() - moment(a.dateOfWork).valueOf();
      });
      const lastEntry = filteredEntries[0];
      if (!lastEntry) {
        return 'N/A';
      }
      const formattedLastEntryDate = moment(lastEntry.dateOfWork).format('YYYY-MM-DD');
      return formattedLastEntryDate;
    } catch (error) {
      console.error('Error fetching time entries:', error);
      if (error.response && error.response.status === 401) {
        loggedOut = true;
      }
      return 'N/A'; // Return "N/A" in case of error
    }
  };
};
export const postTimeEntry = timeEntry => {
  const url = ENDPOINTS.TIME_ENTRY();
  return async dispatch => {
    try {
      const res = await axios.post(url, timeEntry);
      if (timeEntry.entryType == 'default') {
        dispatch(updateTimeEntries(timeEntry));
      }
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
      if (timeEntry.entryType == 'default') {
        dispatch(updateTimeEntries(timeEntry, oldDateOfWork));
      }
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
      if (timeEntry.entryType === 'default') {
        dispatch(updateTimeEntries(timeEntry));
      }
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

export const setUsersTotalHoursPeriod = data => ({
  type: GET_TIME_ENTRIES_PERIOD_BULK,
  payload: data,
});
