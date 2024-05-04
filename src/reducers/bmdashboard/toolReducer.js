import { GET_TOOL_BY_ID, SET_TOOLS } from "constants/bmdashboard/toolsConstants";

const defaultState = []

export const toolReducer = (state = defaultState, action) => {
  switch (action.type) {
    case GET_TOOL_BY_ID:
    case SET_TOOLS:
      return action.payload;
    default:
      return state; // Return the current state for unknown actions
  }
};