import {
  GET_TIME_ENTRIES_WEEK,
  GET_TIME_ENTRIES_PERIOD
} from '../constants/timeEntries'

const initialState = {
  weeks: {
    0: [],
    1: [],
    2: []
  },
  period: []
}

export const timeEntriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TIME_ENTRIES_WEEK: 
      return {
        ...state,
        weeks: {
          ...state.weeks,
          [action.offset]: action.payload
        }
      }
    case GET_TIME_ENTRIES_PERIOD:
      return {
        ...state,
        period: action.payload
      }
    default:
      return state;
  }
}