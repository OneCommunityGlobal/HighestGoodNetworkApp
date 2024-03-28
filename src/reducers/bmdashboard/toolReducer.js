import { GET_TOOL_BY_ID, SET_TOOLS, GET_TOOL_TYPES } from "constants/bmdashboard/toolsConstants";

const defaultState = {
  toolslist: [],
  updateTools: {
    loading: false,
    result: null,
    error: undefined,
  },
  updateToolsBulk: {
    loading: false,
    result: null,
    error: undefined,
  },
};

// eslint-disable-next-line import/prefer-default-export, default-param-last
export const toolReducer = (tools = defaultState, action) => {
  switch (action.type) {
    case GET_TOOL_BY_ID:
    case GET_TOOL_TYPES: {
      // eslint-disable-next-line no-param-reassign
      tools.toolslist = action.payload;
      return {
        ...tools,
        updateTools: { ...defaultState.updateTools },
        updateToolsBulk: { ...defaultState.updateToolsBulk },
      };
    }
    case SET_TOOLS:
      return action.payload;
    default:
      return tools; // Return the current state for unknown actions
  }
};
