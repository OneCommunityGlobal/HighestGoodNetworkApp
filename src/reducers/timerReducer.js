import { SET_TIMER } from '../constants/timer';

const initialState = {
  seconds: 0,
};

export const timerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TIMER:
      return action.payload;
    // case GET_TIME_ENTRIES_PERIOD:
    //   return {
    //     ...state,
    //     period: action.payload
    //   }
    // case ADD_TIME_ENTRY:
    //   return {
    //     ...state,
    //     weeks: {
    //       ...state.weeks,
    //       [action.offset]: [...state.weeks[action.offset], action.payload]
    //     }
    //   }
    default:
      return state;
  }
};
