import { GET_TOOL_BY_ID, GET_TOOLS, SET_TOOLS, GET_TOOL_TYPES } from "constants/bmdashboard/toolsConstants";

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
  // console.log("toolReducer. action: ", action)
  // console.log("action.payload: ", action)
  switch (action.type) {
    case GET_TOOLS: {
      // console.log("GET_TOOLS in the reducer. action.payload: ", action.payload)
      // eslint-disable-next-line no-param-reassign
      tools.toolslist = action.payload;
      // console.log("GET_TOOLS in reducer: ", tools)
      return {
        ...tools,
        updateTools: { ...defaultState.updateTools },
        updateToolsBulk: { ...defaultState.updateToolsBulk },
      };
    }
    case GET_TOOL_BY_ID:
    case GET_TOOL_TYPES: {
      // console.log("GET_TOOL_TYPES in the reducer.")
      // eslint-disable-next-line no-param-reassign
      // tools.toolslist = action.payload;
      // return {
      //   ...tools,
      //   updateTools: { ...defaultState.updateTools },
      //   updateToolsBulk: { ...defaultState.updateToolsBulk },
      // };
    }
    case SET_TOOLS:
      return action.payload;
    default:
      return tools; // Return the current state for unknown actions
  }
};
