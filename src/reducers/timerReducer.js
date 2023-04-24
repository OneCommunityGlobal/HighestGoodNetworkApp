import { SET_TIMER } from '../constants/timer';

const initialState = {
  seconds: 0,
};

export const timerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_TIMER:
      return action.payload;
    default:
      return state;
  }
};
