import axios from 'axios';
// import httpService from 'services/httpService';
import { ENDPOINTS } from '../../utils/URL';

export const getTaskEditSuggestionsHTTP = async () => {
  try {
    return await axios.get(ENDPOINTS.TASK_EDIT_SUGGESTION());
  } catch (error) {
    // console.log(`Error on create task edit suggestion: ${error}`);
    return error;
>>>>>>> 31844d33da974124a93e0eb117d5c2e55a68eb6d
  }
};

export const createTaskEditSuggestionHTTP = async (taskId, userId, oldTask, updatedTask) => {
  try {
    const payload = { taskId, userId, oldTask, newTask: updatedTask };
    await axios.post(ENDPOINTS.TASK_EDIT_SUGGESTION(), payload);
  } catch (error) {
    // console.log(`Error on create task edit suggestion: ${error}`);
    return error;
  }
  return '';
};

export const rejectTaskEditSuggestionHTTP = async taskEditSuggestionId => {
  try {
    await axios.delete(ENDPOINTS.REJECT_TASK_EDIT_SUGGESTION(taskEditSuggestionId));
  } catch (error) {
    // console.log(`reject task edit suggestion http error ${error}`);
    return error;
  }
  return '';
};

export const getTaskEditSuggestionCountHTTP = async () => {
  try {
    return await axios.get(`${ENDPOINTS.TASK_EDIT_SUGGESTION()}?count=true`);
  } catch (error) {
    // console.log(`get task edit suggestion count http error: ${error}`);
    return error;
  }
};
