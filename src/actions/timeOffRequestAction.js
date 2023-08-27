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

const updateTimeOffRequest = (request) => ({
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


export const addTimeOffRequestThunk = (request) => async (dispatch) => {
    try {
        const response = await httpService.post(ENDPOINTS.ADD_TIME_OFF_REQUEST(), request);
        const AddedRequest = response.data;
        console.log(response)
        dispatch(addTimeOffRequest(AddedRequest));
    } catch (error) {
        console.log(error)
    }
};

export const updateTimeOffRequestThunk = (id, data) => async (dispatch) => {
    // data Should include duration, startingDate and reason 
    try {
        const response = await httpService.post(ENDPOINTS.UPDATE_TIME_OFF_REQUEST(id), data);
        const updatedRequest = response.data;
        dispatch(updateTimeOffRequest(updatedRequest))
    } catch (error) {
        console.log(error)
    }
};

export const deleteTimeOffRequestThunk = (id) => async (dispatch) => {
    try {
        const response = await httpService.delete(ENDPOINTS.DELETE_TIME_OFF_REQUEST(id));
        const deletedRequest = response.data;
        dispatch(deleteTimeOffRequest(deletedRequest))
    } catch (error) {
        console.log(error)
    }
};
