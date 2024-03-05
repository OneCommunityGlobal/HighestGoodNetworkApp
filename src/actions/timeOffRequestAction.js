import httpService from 'services/httpService';

import {
  FETCH_TIME_OFF_REQUESTS_SUCCESS,
  FETCH_TIME_OFF_REQUESTS_FAILURE,
  ADD_TIME_OF_REQUEST,
  UPDATE_TIME_OF_REQUEST,
  DELETE_TIME_OF_REQUEST,
  ADD_IS_ON_TIME_OFF_REQUESTS,
  ADD_GOING_ON_TIME_OFF_REQUESTS,
  TIME_OFF_REQUEST_DETAIL_MODAL_OPEN,
  TIME_OFF_REQUEST_DETAIL_MODAL_CLOSE,
} from '../constants/timeOffRequestConstants';
import { ENDPOINTS } from '../utils/URL';
import moment from 'moment';
import 'moment-timezone';

/**
 * fetching all time Off Requests
 */
// Action Creators
const fetchTimeOffRequestsSuccess = requests => ({
  type: FETCH_TIME_OFF_REQUESTS_SUCCESS,
  payload: requests,
});

const fetchTimeOffRequestsFailure = error => ({
  type: FETCH_TIME_OFF_REQUESTS_FAILURE,
  payload: error,
});

const addIsOnTimeOffRequests = request => ({
  type: ADD_IS_ON_TIME_OFF_REQUESTS,
  payload: request,
});

const addGoingOnTimeOffRequests = request => ({
  type: ADD_GOING_ON_TIME_OFF_REQUESTS,
  payload: request,
});

const addTimeOffRequest = request => ({
  type: ADD_TIME_OF_REQUEST,
  payload: request,
});

const updateTimeOffRequest = request => ({
  type: UPDATE_TIME_OF_REQUEST,
  payload: request,
});

const deleteTimeOffRequest = request => ({
  type: DELETE_TIME_OF_REQUEST,
  payload: request,
});

export const showTimeOffRequestModal = request => ({
  type: TIME_OFF_REQUEST_DETAIL_MODAL_OPEN,
  payload: request,
});

export const hideTimeOffRequestModal = () => ({
  type: TIME_OFF_REQUEST_DETAIL_MODAL_CLOSE,
});

// Thunk Function
export const getAllTimeOffRequests = () => async dispatch => {
  try {
    const response = await httpService.get(ENDPOINTS.GET_TIME_OFF_REQUESTS());
    const requests = response.data;
    dispatch(fetchTimeOffRequestsSuccess(requests));
    const keys = Object.keys(requests);
    let onVacation = {};
    let goingOnVacation = {};
    for (const key of keys) {
      const arrayOfRequests = requests[key];
      const isUserOff = isUserOnVacation(arrayOfRequests);
      const isUserGoingOff = isUserGoingOnVacation(arrayOfRequests);
      if (isUserOff) {
        onVacation = { ...onVacation, [key]: { ...isUserOff } };
      } else if (isUserGoingOff) {
        goingOnVacation = { ...goingOnVacation, [key]: { ...isUserGoingOff } };
      }
    }
    dispatch(addIsOnTimeOffRequests(onVacation));
    dispatch(addGoingOnTimeOffRequests(goingOnVacation));
  } catch (error) {
    dispatch(fetchTimeOffRequestsFailure(error.message));
  }
};

export const addTimeOffRequestThunk = request => async dispatch => {
  try {
    const response = await httpService.post(ENDPOINTS.ADD_TIME_OFF_REQUEST(), request);
    const AddedRequest = response.data;
    dispatch(addTimeOffRequest(AddedRequest));
  } catch (error) {
    console.log(error);
  }
};

export const updateTimeOffRequestThunk = (id, data) => async dispatch => {
  // data Should include duration, startingDate and reason
  try {
    const response = await httpService.post(ENDPOINTS.UPDATE_TIME_OFF_REQUEST(id), data);
    const updatedRequest = response.data;
    dispatch(updateTimeOffRequest(updatedRequest));
  } catch (error) {
    console.log(error);
  }
};

export const deleteTimeOffRequestThunk = id => async dispatch => {
  try {
    const response = await httpService.delete(ENDPOINTS.DELETE_TIME_OFF_REQUEST(id));
    const deletedRequest = response.data;
    dispatch(deleteTimeOffRequest(deletedRequest));
  } catch (error) {
    console.log(error);
  }
};

const isTimeOffRequestIncludeCurrentWeek = request => {
  const { startingDate, endingDate } = request;

  moment.tz.setDefault('America/Los_Angeles');

  const requestStartingDate = moment(startingDate);
  const requestEndingDate = moment(endingDate);

  const currentWeekStart = moment().startOf('week').add(1, 'second');
  const currentWeekEnd = moment().endOf('week').subtract(1, 'day').subtract(1, 'second');

  // Check if the current week falls within the date range of the request
  if (
    currentWeekStart.isSameOrAfter(requestStartingDate) &&
    currentWeekEnd.isSameOrBefore(requestEndingDate)
  ) {
    return true;
  }

  return false;
};

const isUserOnVacation = requests => {
  moment.tz.setDefault('America/Los_Angeles');

  for (const request of requests) {
    if (isTimeOffRequestIncludeCurrentWeek(request)) {
      return request;
    }
  }
  return null;
};

const isUserGoingOnVacation = requests => {
  moment.tz.setDefault('America/Los_Angeles');

  const nextWeekStart = moment()
    .add(1, 'week')
    .startOf('week');

  // Find the first request that starts on Sunday next week
  const userGoingOnVacation = requests.find(request => {
    const startingDate = moment(request.startingDate);
    return startingDate.isSame(nextWeekStart, 'day');
  });

  return userGoingOnVacation || null;
};
