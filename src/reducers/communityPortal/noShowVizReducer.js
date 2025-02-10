// reducers.js

import {
  GET_NO_SHOWS_DATA,
  GET_NO_SHOWS_BY_LOCATION,
  GET_NO_SHOWS_BY_AGE_GROUP,
  GET_NO_SHOW_PROPORTIONS,
  GET_UNIQUE_EVENT_TYPES,
  GET_ATTENDANCE_BY_DAY,
  SET_ERROR,
} from '../../constants/communityPortal/NoShowVizConstants';

const initialState = {
  noShowsData: [],
  noShowsByLocation: [],
  noShowsByAgeGroup: [],
  noShowProportions: [],
  uniqueEventTypes: [],
  attendanceByDay: [],
  error: null,
};

export const noShowVizReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NO_SHOWS_DATA:
      return {
        ...state,
        noShowsData: action.payload,
        error: null,
      };

    case GET_NO_SHOWS_BY_LOCATION:
      return {
        ...state,
        noShowsByLocation: action.payload,
        error: null,
      };

    case GET_NO_SHOWS_BY_AGE_GROUP:
      return {
        ...state,
        noShowsByAgeGroup: action.payload,
        error: null,
      };

    case GET_NO_SHOW_PROPORTIONS:
      return {
        ...state,
        noShowProportions: action.payload,
        error: null,
      };

    case GET_UNIQUE_EVENT_TYPES:
      return {
        ...state,
        uniqueEventTypes: action.payload,
        error: null,
      };

    case GET_ATTENDANCE_BY_DAY:
      return {
        ...state,
        attendanceByDay: action.payload,
        error: null,
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default noShowVizReducer;
