import { GET_TOOL_BY_ID, GET_TOOLS, SET_TOOLS } from "constants/bmdashboard/toolsConstants";

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

// eslint-disable-next-line import/prefer-default-export
export const toolReducer = (tools = defaultState, action) => {
  switch (action.type) {
    case GET_TOOLS: {
      // eslint-disable-next-line no-param-reassign
      tools.toolslist = action.payload;
      return {
        ...tools,
        updateTools: { ...defaultState.updateTools },
        updateToolsBulk: { ...defaultState.updateToolsBulk },
      };
    }
    case GET_TOOL_BY_ID:
    case SET_TOOLS:
      return action.payload;
///////
    // case POST_TOOLS_LOG:
    //   return {
    //     // eslint-disable-next-line no-undef
    //     ...state,
    //     postedResult: {
    //       result: action.payload,
    //       success: true,
    //       error: false,
    //     },
    //   };
    // case POST_ERROR_TOOLS_LOG:
    //   return {
    //     // eslint-disable-next-line no-undef
    //     ...state,
    //     postedResult: {
    //       result: action.payload,
    //       success: false,
    //       error: true,
    //     },
    //   };
    // case RESET_POST_TOOLS_LOG:
    //   return {
    //     // eslint-disable-next-line no-undef
    //     ...state,
    //     postedResult: {
    //       result: null,
    //       success: null,
    //       error: null,
    //     },
    //   };
///////
    default:
      return tools; // Return the current state for unknown actions
  }
};
