export const GET_AI_PROMPT_TEXT = 'GET_AI_PROMPT_TEXT';
export const UPDATE_AI_PROMPT_TEXT = 'UPDATE_AI_PROMPT_TEXT';

export const getAIPrompt = payload => {
  return {
    type: GET_AI_PROMPT_TEXT,
    payload,
  };
};

export const updateAIPrompt = payload => {
  return {
    type: UPDATE_AI_PROMPT_TEXT,
    payload,
  };
};
