import { ENDPOINTS } from '../utils/URL';
import axios from 'axios';
import {
  getDashboardDataAIPrompt as getDashboardDataAIPrompts,
  updateDashboardDataAIPrompt as updateDashboardDataAIPrompts
} from '../constants/dashBoard'


export const getDashboardDataAI = () => {
  return async dispatch => {
    const url = ENDPOINTS.AI_PROMPT();
    try {
      const response = await axios.get(url);
      dispatch(getDashboardDataAIPrompts(response.data));
      return response.status;
    } catch (error) {
      dispatch(getDashboardDataAIPrompts(error));
      return error.response.status;
    }
  }
}

export const updateDashboardData = (textPrompt) => {
  const updatedData = {
    aIPromptText: textPrompt
  };
  return async dispatch => {
    await axios.put(ENDPOINTS.AI_PROMPT(), updatedData)
      .then(dispatch(updateDashboardDataAIPrompts(textPrompt)));
  }
}
