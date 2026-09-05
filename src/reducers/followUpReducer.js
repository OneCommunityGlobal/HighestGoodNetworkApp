import * as types from '../constants/followUpConstants';

const initialState = {
  followUps: {},
  error: null,
};

// eslint-disable-next-line default-param-last
export const followUpReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_ALL_FOLLOWUPS:
      return { ...state, followUps: action.payload, error: null };
    case types.SET_FOLLOWUP: {
      const existingUserFollowUps = state.followUps[action.payload.userId];
      let updatedFollowUps;
      if (!existingUserFollowUps) {
        updatedFollowUps = [action.payload];
      } else if (existingUserFollowUps.some(ele => ele.taskId === action.payload.taskId)) {
        updatedFollowUps = existingUserFollowUps.map(ele =>
          ele.taskId === action.payload.taskId ? action.payload : ele,
        );
      } else {
        updatedFollowUps = [...existingUserFollowUps, action.payload];
      }
      return {
        ...state,
        followUps: {
          ...state.followUps,
          [action.payload.userId]: updatedFollowUps,
        },
        error: null,
      };
    }
    case types.SET_FOLLOWUP_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default followUpReducer;
