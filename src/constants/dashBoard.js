export const GET_AI_PROMPT_TEXT = 'GET_AI_PROMPT_TEXT';
export const UPDATE_AI_PROMPT_TEXT = 'UPDATE_AI_PROMPT_TEXT';

export const getDashboardDataAIPrompt = payload => {
  return {
    type: GET_AI_PROMPT_TEXT,
    payload,
  };
};

export const updateDashboardDataAIPrompt = payload => {
  return {
    type: UPDATE_AI_PROMPT_TEXT,
    payload,
  };
};
