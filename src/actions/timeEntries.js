import axios from 'axios'
import moment from "moment";
import {
    GET_TIME_ENTRIES_WEEK,
    GET_TIME_ENTRIES_PERIOD
} from '../constants/timeEntries'
import { ENDPOINTS } from '../utils/URL'
import { timeEntriesReducer } from '../reducers/timeEntriesReducer';

/** 
 * number === 0 current week
 * number === 1 last week
 * number === 2 week before last
*/
export const getTimeEntriesForWeek = (userId, offset) => {
    const fromDate = moment()
                    .startOf("week")
                    .subtract(offset, "weeks");
    const toDate = moment()
                    .endOf("week")
                    .subtract(offset, "weeks");
	const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
	return async dispatch => {
		const res = await axios.get(url)
		await dispatch(setTimeEntriesForWeek(res.data, offset))
	}
}

export const getTimeEntriesForPeriod = (userId, fromDate, toDate) => {
	const url = ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate);
	return async dispatch => {
		const res = await axios.get(url)
		await dispatch(setTimeEntriesForPeriod(res.data))
	}
}

export const postTimeEntry = timeEntry => {
    const url = ENDPOINTS.TIME_ENTRY();
    return async dispatch => {
        await axios.post(url, timeEntry)
    }
}

export const setTimeEntriesForWeek = (data, offset) => ({
    type: GET_TIME_ENTRIES_WEEK,
    payload: data,
    offset: offset
})

export const setTimeEntriesForPeriod = data => ({
    type: GET_TIME_ENTRIES_PERIOD,
    payload: data,
})