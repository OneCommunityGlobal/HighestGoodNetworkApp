const initialState = null;

// eslint-disable-next-line default-param-last
const weeklySummariesAIPromptReducer = (dashboardData = initialState, action) => {
  switch (action.type) {
    case 'GET_AI_PROMPT_TEXT':
      return action.payload;

    case 'UPDATE_AI_PROMPT_TEXT':
      return dashboardData;

    default:
      return dashboardData;
  }
};

export default weeklySummariesAIPromptReducer;
