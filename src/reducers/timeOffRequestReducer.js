import * as types from './../constants/timeOffRequestConstants';

const initialState = {
  requests: {},
  onTimeOff: {},
  goingOnTimeOff: {},
  futureTimeOff: {},
  timeOffModal: {
    isOpen: false,
    data: {},
  },
  error: null,
};

export const timeOffRequestsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_TIME_OFF_REQUESTS_SUCCESS:
      return { ...state, requests: action.payload, error: null };
    case types.FETCH_TIME_OFF_REQUESTS_FAILURE:
      return { ...state, requests: {}, error: action.payload };
    case types.ADD_TIME_OF_REQUEST:
      const key = action.payload.requestFor;
      const updatedKeyRequests = [...(state.requests[key] || []), action.payload];
      return {
        ...state,
        requests: {
          ...state.requests,
          [key]: updatedKeyRequests,
        },
      };
    case types.UPDATE_TIME_OF_REQUEST:
      const id = action.payload.requestFor;
      return {
        ...state,
        requests: {
          ...state.requests,
          [id]: state.requests[id].map(request => {
            if (request._id === action.payload._id) {
              return {
                ...request,
                ...action.payload,
              };
            }
            return request;
          }),
        },
      };
    case types.DELETE_TIME_OF_REQUEST:
      const { requestFor, _id } = action.payload;
      return {
        ...state,
        requests: {
          ...state.requests,
          [requestFor]: state.requests[requestFor].filter(request => request._id !== _id),
        },
      };
    case types.ADD_IS_ON_TIME_OFF_REQUESTS: {
      return { ...state, onTimeOff: action.payload, error: null };
    }
    case types.ADD_GOING_ON_TIME_OFF_REQUESTS: {
      return { ...state, goingOnTimeOff: action.payload, error: null };
    }
    case types.ADD_FUTURE_TIME_OFF: {
      return { ...state, futureTimeOff: action.payload, error: null };
    }
    case types.TIME_OFF_REQUEST_DETAIL_MODAL_OPEN: {
      return {
        ...state,
        timeOffModal: {
          ...state.timeOffModal,
          isOpen: true,
          data: action.payload,
        },
        error: null,
      };
    }
    case types.TIME_OFF_REQUEST_DETAIL_MODAL_CLOSE: {
      return {
        ...state,
        timeOffModal: {
          ...state.timeOffModal,
          isOpen: false,
          data: {},
        },
        error: null,
      };
    }
    default:
      return state;
  }
};
