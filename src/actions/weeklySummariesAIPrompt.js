import { ENDPOINTS } from '../utils/URL';
import axios from 'axios';
import {
  getAIPrompt as getAIPrompt,
  updateAIPrompt as updateAIPrompt,
} from '../constants/weeklySummariesAIPrompt';

export const getDashboardDataAI = () => {
  const DashboardDataAIPromise = axios.get(ENDPOINTS.AI_PROMPT());
  return async dispatch => {
    return DashboardDataAIPromise
      .then((res) => {
        dispatch(getAIPrompt(res.data));
        return res.data;
      })
      .catch(() => {
        dispatch(getAIPrompt(undefined));
      });
  };
};

export const updateDashboardData = textPrompt => {
  const updatedData = {
    aIPromptText: textPrompt,
  };
  return async dispatch => {
    await axios
      .put(ENDPOINTS.AI_PROMPT(), updatedData)
      .then(dispatch(updateAIPrompt(textPrompt)));
  };
};
