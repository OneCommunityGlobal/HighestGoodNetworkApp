import axios from 'axios'
import moment from "moment";
import {
    GET_TIME_ENTRIES_WEEK,
    GET_TIME_ENTRIES_PERIOD,
    ADD_TIME_ENTRY
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
        try {
            const res = await axios.post(url, timeEntry);

            const startOfWeek = moment().startOf("week");
            const offset = Math.ceil(startOfWeek.diff(timeEntry.dateOfWork, 'week', true));

            if (offset <= 2 && offset >= 0) {
                dispatch(getTimeEntriesForWeek(timeEntry.personId, offset));
            }
            // dispatch(addTimeEntry(timeEntry));
            return res.status;
        } catch(e) {
            return e.response.status;
        }
    }
}

// export const addTimeEntry = timeEntry => {
//     const startOfWeek = moment().startOf("week");
//     const offset = Math.ceil(startOfWeek.diff(timeEntry.dateOfWork, 'week', true));

//     if (offset <= 2 && offset >= 0) {
//         return {
//             type: ADD_TIME_ENTRY,
//             payload: timeEntry,
//             offset: offset
//         }
//     }
// }

export const setTimeEntriesForWeek = (data, offset) => ({
    type: GET_TIME_ENTRIES_WEEK,
    payload: data,
    offset: offset
})

export const setTimeEntriesForPeriod = data => ({
    type: GET_TIME_ENTRIES_PERIOD,
    payload: data,
})
