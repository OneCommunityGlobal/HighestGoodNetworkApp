export const GET_AI_PROMPT_TEXT = 'GET_AI_PROMPT_TEXT';
export const UPDATE_AI_PROMPT_TEXT = 'UPDATE_AI_PROMPT_TEXT';
export const UPDATE_COPIED_PROMPT = 'UPDATE_COPIED_PROMPT';
export const GET_PROMPT_COPIED_DATE = 'GET_PROMPT_COPIED_DATE';

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
export const updateCopiedPrompt = payload => {
  return {
    type: UPDATE_COPIED_PROMPT,
    payload,
  };
};

export const getCopiedPromptDate = payload => {
  return {
    type: GET_PROMPT_COPIED_DATE,
    payload,
  };
};
