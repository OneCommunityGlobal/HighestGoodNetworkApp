import axios from 'axios';
import moment from 'moment';
import {
    GET_TIME_ENTRIES_WEEK,
    GET_TIME_ENTRIES_PERIOD,
} from '../constants/timeEntries';
import { ENDPOINTS } from '../utils/URL';

/**
 * number === 0 current week
 * number === 1 last week
 * number === 2 week before last
*/
export const getTimeEntriesForWeek = (userId, offset) => {
    const fromDate = moment()
        .startOf('week')
        .subtract(offset, 'weeks');
        const toDate = moment()
        .endOf('week')
        .subtract(offset, 'weeks');
    const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
    return async (dispatch) => {
        let loggedOut = false;
        const res = await axios.get(url).catch((error)=>{
			if (error.status===401) {
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
    return async (dispatch) => {
        let loggedOut = false;
        const res = await axios.get(url).catch((error)=>{
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

export const postTimeEntry = (timeEntry) => {
    const url = ENDPOINTS.TIME_ENTRY();
    return async (dispatch) => {
        try {
            const res = await axios.post(url, timeEntry);
            dispatch(updateTimeEntries(timeEntry));
            return res.status;
        } catch (e) {
            return e.response.status;
        }
    };
};

export const editTimeEntry = (timeEntryId, timeEntry) => {
    const url = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntryId);
    return async (dispatch) => {
        try {
            const res = await axios.put(url, timeEntry);
            dispatch(updateTimeEntries(timeEntry));
            return res.status;
        } catch (e) {
            return e.response.status;
        }
    };
};

export const deleteTimeEntry = (timeEntry) => {
    const url = ENDPOINTS.TIME_ENTRY_CHANGE(timeEntry._id);
    return async (dispatch) => {
        try {
            const res = await axios.delete(url);
            dispatch(updateTimeEntries(timeEntry));
            return res.status;
        } catch (e) {
            return e.response.status;
        }
    };
};

const updateTimeEntries = (timeEntry) => {
    const startOfWeek = moment().startOf('week');
    const offset = Math.ceil(startOfWeek.diff(timeEntry.dateOfWork, 'week', true));

    return async (dispatch) => {
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
