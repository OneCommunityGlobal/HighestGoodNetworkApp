import { ENDPOINTS } from '../utils/URL';
import axios from 'axios';
import {
  getAIPrompt as getAIPrompt,
  updateAIPrompt as updateAIPrompt,
  updateCopiedPrompt as updateCopiedPrompt,
} from '../constants/weeklySummariesAIPrompt';
import { dispatch } from 'd3';

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

export const updateCopiedPromtDate = (userId) => {
 return async dispatch => {
  await axios.put(ENDPOINTS.COPIED_AI_PROMPT(),userId)
  .then(dispatch(updateCopiedPrompt(userId)));
 }
}