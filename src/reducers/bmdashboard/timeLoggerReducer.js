/* eslint-disable no-case-declarations */
import {
  START_TIME_LOG,
  PAUSE_TIME_LOG,
  STOP_TIME_LOG,
  GET_CURRENT_TIME_LOG,
} from '../../constants/bmdashboard/timeLoggerConstants';

const initialState = {
  bmTimeLogs: {}, // A map of { memberId_projectId: timeLog }
  bmTimeLogHistory: [],
};

// eslint-disable-next-line default-param-last
export const bmTimeLoggerReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_TIME_LOG:
      const startKey = `${action.payload.memberId}_${action.payload.projectId}`;
      return {
        ...state,
        bmTimeLogs: {
          ...state.bmTimeLogs,
          [startKey]: action.payload, // Store time log specific to member and project
        },
        bmTimeLogHistory: [...state.bmTimeLogHistory, action.payload],
      };

    case PAUSE_TIME_LOG:
      const pauseKey = `${action.payload.memberId}_${action.payload.projectId}`;
      return {
        ...state,
        bmTimeLogs: {
          ...state.bmTimeLogs,
          [pauseKey]: action.payload, // Update specific member's time log
        },
      };

    case STOP_TIME_LOG:
      const stopKey = `${action.payload.memberId}_${action.payload.projectId}`;
      return {
        ...state,
        bmTimeLogs: {
          ...state.bmTimeLogs,
          [stopKey]: null, // Reset specific member's time log
        },
        bmTimeLogHistory: [...state.bmTimeLogHistory, action.payload],
      };

    case GET_CURRENT_TIME_LOG:
      const getKey = `${action.payload.memberId}_${action.payload.projectId}`;
      return {
        ...state,
        bmTimeLogs: {
          ...state.bmTimeLogs,
          [getKey]: action.payload, // Get specific member's time log
        },
      };

    default:
      return state;
  }
};

export default bmTimeLoggerReducer;
