import { ENDPOINTS } from '../utils/URL';
import axios from 'axios';
import {
  getAIPrompt as getAIPrompt,
  updateAIPrompt as updateAIPrompt,
  updateCopiedPrompt as updateCopiedPrompt,
  getCopiedPromptDate as getCopiedPromptDate,
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
// ===========================================================================
// This function is executed each time the user copies the AI prompt from the modal and updates the copied Date in the userProfile - Sucheta

export const updateCopiedPromptDate = (userId) => {
  return async dispatch => {
   await axios.put(ENDPOINTS.COPIED_AI_PROMPT(userId))
   .then(dispatch(updateCopiedPrompt(userId)));
  }
 }
// This function is executed each time there is change of copied AI prompt date - Sucheta
export const getCopiedDateOfPrompt = (userId) =>{
  const CopiedPromptDate = axios.get(ENDPOINTS.COPIED_AI_PROMPT(userId));
  return async dispatch =>{
    return CopiedPromptDate
    .then(res=>{
      dispatch(getCopiedPromptDate(res.data.message));
      return res.data.message;
    })
    .catch(()=>{
      dispatch(getCopiedPromptDate(undefined));
    })
  }

}