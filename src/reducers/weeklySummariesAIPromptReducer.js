const initialState = null;

// Adjusted parameter order
export default function weeklySummariesAIPromptReducer(
  action,
  dashboardData = initialState
) {
  switch (action.type) {
    case 'GET_AI_PROMPT_TEXT':
      return action.payload;

    case 'UPDATE_AI_PROMPT_TEXT':
      return dashboardData;

    default:
      return dashboardData;
  }
}
