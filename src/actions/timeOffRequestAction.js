import httpService from 'services/httpService';

import {
    FETCH_TIME_OFF_REQUESTS_SUCCESS,
    FETCH_TIME_OFF_REQUESTS_FAILURE
} from '../constants/timeOffRequestConstants';
import { ENDPOINTS } from '../utils/URL';

/**
 * fetching all time Off Requests
 */
// Action Creators
const fetchTimeOffRequestsSuccess = (requests) => ({
    type: FETCH_TIME_OFF_REQUESTS_SUCCESS,
    payload: requests
});

const fetchTimeOffRequestsFailure = (error) => ({
    type: FETCH_TIME_OFF_REQUESTS_FAILURE,
    payload: error
});

// Thunk Function
export const getAllTimeOffRequests = () => async (dispatch) => {
    try {
        const response = await httpService.get(ENDPOINTS.GET_TIME_OFF_REQUESTS());
        const requests = response.data;
        dispatch(fetchTimeOffRequestsSuccess(requests));
    } catch (error) {
        dispatch(fetchTimeOffRequestsFailure(error.message));
    }
};