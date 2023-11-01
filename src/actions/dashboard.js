import { ENDPOINTS } from '../utils/URL';
import axios from 'axios';
import {
  getDashboardDataAIPrompt as getDashboardDataAIPrompts,
  updateDashboardDataAIPrompt as updateDashboardDataAIPrompts,
} from '../constants/dashBoard';

export const getDashboardDataAI = () => {
  const DashboardDataAIPromise = axios.get(ENDPOINTS.AI_PROMPT());
  return async dispatch => {
    return DashboardDataAIPromise
      .then((res) => {
        dispatch(getDashboardDataAIPrompts(res.data));
        return res.data;
      })
      .catch(() => {
        dispatch(getDashboardDataAIPrompts(undefined));
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
      .then(dispatch(updateDashboardDataAIPrompts(textPrompt)));
  };
};
