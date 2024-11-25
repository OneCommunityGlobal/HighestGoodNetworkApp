import axios from 'axios';
import moment from 'moment';
import { GET_TIME_ENTRIES_WEEK, GET_TIME_ENTRIES_PERIOD } from '../constants/timeEntries';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action Creators
 */
export const setTimeEntriesForWeek = (data, offset) => ({
  type: GET_TIME_ENTRIES_WEEK,
  payload: data,
  offset,
});

export const setTimeEntriesForPeriod = (data) => ({
  type: GET_TIME_ENTRIES_PERIOD,
  payload: data,
});

export const getTimeEntriesForWeek = (userId, offset) => {
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
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      if (res && res.data) {
        const filteredEntries = res.data.filter((entry) => {
          const entryDate = moment(entry.dateOfWork);
          return entryDate.isBetween(fromDate, toDate, 'day', '[]');
        });
        await dispatch(setTimeEntriesForWeek(filteredEntries, offset));
      }
    } catch (error) {
      // Handle error if needed
    }
  };
};

/**
 * Helper Function to Update Time Entries
 */
const updateTimeEntries = (timeEntry, oldDateOfWork) => {
  const startOfWeek = moment().startOf('week');

  return async (dispatch) => {
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

/**
 * Thunk Functions
 */


export const getTimeEntriesForPeriod = (userId, fromDateInput, toDateInput) => {
  const toDate = moment(toDateInput).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDateInput, toDate);
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      if (res && res.data) {
        const filteredEntries = res.data.filter((entry) => {
          const entryDate = moment(entry.dateOfWork);
          return entryDate.isBetween(fromDateInput, toDate, 'day', '[]');
        });
        filteredEntries.sort((a, b) => {
          return moment(b.dateOfWork).valueOf() - moment(a.dateOfWork).valueOf();
        });

        await dispatch(setTimeEntriesForPeriod(filteredEntries));
      }
    } catch (error) {
      // Handle error if needed
    }
  };
};

export const getTimeEndDateEntriesByPeriod = (userId, fromDate, toDate) => {
  const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DD');
  const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, formattedToDate);
  return async () => {
    try {
      const res = await axios.get(url);
      if (!res || !res.data) {
        return 'N/A';
      }
      const filteredEntries = res.data.filter((entry) => {
        const entryDate = moment(entry.dateOfWork);
        return entryDate.isBetween(fromDate, formattedToDate, 'day', '[]');
      });
      filteredEntries.sort((a, b) => {
        return moment(b.dateOfWork).valueOf() - moment(a.dateOfWork).valueOf();
      });
      const lastEntry = filteredEntries[0];
      if (!lastEntry) {
        return 'N/A';
      }
      return moment(lastEntry.dateOfWork).format('YYYY-MM-DD');
    } catch (error) {
      // Handle error if needed
      return 'N/A';
    }
  };
};

export const postTimeEntry = (timeEntry) => {
  const url = ENDPOINTS.TIME_ENTRY();
  return async (dispatch) => {
    try {
      const res = await axios.post(url, timeEntry);
      if (timeEntry.entryType === 'default') {
        dispatch(updateTimeEntries(timeEntry));
      }
      return res.status;
    } catch (e) {
      return e.response?.status || 500;
    }
  };
};

export const editTimeEntry = (timeEntryId, timeEntry, oldDateOfWork) => {
  const url = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntryId);
  return async (dispatch) => {
    try {
      const res = await axios.put(url, timeEntry);
      if (timeEntry.entryType === 'default') {
        dispatch(updateTimeEntries(timeEntry, oldDateOfWork));
      }
      return res.status;
    } catch (e) {
      return e.response?.status || 500;
    }
  };
};

export const deleteTimeEntry = (timeEntry) => {
  const url = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntry._id);
  return async (dispatch) => {
    try {
      const res = await axios.delete(url);
      if (timeEntry.entryType === 'default') {
        dispatch(updateTimeEntries(timeEntry));
      }
      return res.status;
    } catch (e) {
      return e.response?.status || 500;
    }
  };
};
