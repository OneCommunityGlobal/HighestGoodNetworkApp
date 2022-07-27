import axios from 'axios';
import httpService from 'services/httpService';
import { ENDPOINTS } from 'utils/URL';

export const getTaskEditSuggestionsHTTP = async () => {
  try {
    return await axios.get(ENDPOINTS.TASK_EDIT_SUGGESTION());
  } catch (error) {
    console.log('Error on create task edit suggestion: ' + error);
  } 
};

export const createTaskEditSuggestionHTTP = async ( taskId, userId, oldTask, updatedTask ) => {
  try {
    const payload = { taskId, userId, oldTask, newTask: updatedTask };
    await axios.post(ENDPOINTS.TASK_EDIT_SUGGESTION(), payload);
  } catch (error) {
    console.log('Error on create task edit suggestion: ' + error);
  } 
};

export const rejectTaskEditSuggestionHTTP = async ( taskEditSuggestionId ) => {
  try {
    console.log('reject http');
    await axios.delete(ENDPOINTS.REJECT_TASK_EDIT_SUGGESTION(taskEditSuggestionId));
  } catch (error) {
    'reject task edit suggestion http error\n' + error
  }
};