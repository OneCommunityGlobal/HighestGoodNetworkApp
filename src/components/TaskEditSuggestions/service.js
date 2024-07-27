import axios from 'axios';
import httpService from 'services/httpService';
import { ENDPOINTS } from 'utils/URL';

export const getTaskEditSuggestionsHTTP = async () => {
  try {
    const response =  await axios.get(ENDPOINTS.TASK_EDIT_SUGGESTION());
    //console.log('Response:', response.data); 
    return response.data;
  } catch (error) {
    console.log(`Error on create task edit suggestion: ${  error}`);
  }
};

export const createTaskEditSuggestionHTTP = async (taskId, userId, oldTask, updatedTask) => {
  try {
    const payload = { taskId, userId, oldTask, newTask: updatedTask };
    const response =  await axios.post(ENDPOINTS.TASK_EDIT_SUGGESTION(), payload);
    return response.data;
  } catch (error) {
    console.log(`Error on create task edit suggestion: ${  error}`);
  }
};

export const rejectTaskEditSuggestionHTTP = async taskEditSuggestionId => {
  try {
    const response = await axios.delete(ENDPOINTS.REJECT_TASK_EDIT_SUGGESTION(taskEditSuggestionId));
    return response.data;
  } catch (error) {
    console.log(`reject task edit suggestion http error ${  error}`);
  }
};

export const getTaskEditSuggestionCountHTTP = async () => {
  try {
    const response = await axios.get(`${ENDPOINTS.TASK_EDIT_SUGGESTION()}?count=true`);
    return response.data;
  } catch (error) {
    console.log(`get task edit suggestion count http error: ${  error}`);
  }
};
