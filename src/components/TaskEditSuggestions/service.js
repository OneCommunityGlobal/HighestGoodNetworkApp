import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

export const getTaskEditSuggestionsHTTP = async () => {
  const response = await axios.get(ENDPOINTS.TASK_EDIT_SUGGESTION());
  return response.data;
};

export const createTaskEditSuggestionHTTP = async (taskId, userId, oldTask, updatedTask) => {
  const payload = { taskId, userId, oldTask, newTask: updatedTask };
  const response = await axios.post(ENDPOINTS.TASK_EDIT_SUGGESTION(), payload);
  return response.data;
};

export const rejectTaskEditSuggestionHTTP = async (taskEditSuggestionId) => {
  const response = await axios.delete(ENDPOINTS.REJECT_TASK_EDIT_SUGGESTION(taskEditSuggestionId));
  return response.data;
};

export const getTaskEditSuggestionCountHTTP = async () => {
  const response = await axios.get(`${ENDPOINTS.TASK_EDIT_SUGGESTION()}?count=true`);
  return response.data;
};
