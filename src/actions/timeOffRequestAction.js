import httpService from 'services/httpService';

import {
    FETCH_TIME_OFF_REQUESTS_SUCCESS,
    FETCH_TIME_OFF_REQUESTS_FAILURE,
    ADD_TIME_OF_REQUEST,
    UPDATE_TIME_OF_REQUEST,
    DELETE_TIME_OF_REQUEST,
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

const addTimeOffRequest = (request) => ({
    type: ADD_TIME_OF_REQUEST,
    payload: request
});

const updateTimeRequest = (request) => ({
    type: UPDATE_TIME_OF_REQUEST,
    payload: request
});

const deleteTimeOffRequest = (request) => ({
    type: DELETE_TIME_OF_REQUEST,
    payload: request
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