import * as types from './../constants/followUpConstants';

const initialState = {
  followUps: {},
  error: null,
};

export const followUpReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_ALL_FOLLOWUPS:
      return { ...state, followUps: action.payload, error: null };
    case types.SET_FOLLOWUP:
      return {
        ...state,
        followUps: {
          ...state.followUps,
          [action.payload.userId]: state.followUps[action.payload.userId]
            ? state.followUps[action.payload.userId].map(ele =>
                ele.taskId === action.payload.taskId ? action.payload : ele,
              )
            : [action.payload],
        },
        error: null,
      };
    case types.SET_FOLLOWUP_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};
