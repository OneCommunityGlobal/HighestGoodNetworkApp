import { toast } from 'react-toastify';
import httpService from '../services/httpService';
import { ENDPOINTS } from '~/utils/URL';

// Re-export all actions from studentTasks
export {
  setStudentTasksStart,
  setStudentTasks,
  setStudentTasksError,
  updateStudentTask,
  fetchStudentTasks,
  markStudentTaskAsDone,
  // Aliases
  fetchStudentTasks as fetchIntermediateTasks,
  markStudentTaskAsDone as markIntermediateTaskAsDone,
  updateStudentTask as updateIntermediateTask,
} from './studentTasks';

/**
 * Create a new intermediate task
 * @param {Object} taskData - The task data to create
 */
export const createIntermediateTask = (taskData) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const userId = state.auth.user.userid;

      const response = await httpService.post(
        `${ENDPOINTS.APIEndpoint()}/education-tasks/intermediate`,
        { ...taskData, createdBy: userId }
      );

      if (response.data.success) {
        toast.success('Task created successfully!');
        return response.data.task;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create task';
      toast.error(errorMessage);
      throw error;
    }
  };
};

/**
 * Delete an intermediate task
 * @param {string} taskId - The task ID to delete
 */
export const deleteIntermediateTask = (taskId) => {
  return async (dispatch, getState) => {
    try {
      const response = await httpService.delete(
        `${ENDPOINTS.APIEndpoint()}/education-tasks/intermediate/${taskId}`
      );

      if (response.data.success) {
        toast.success('Task deleted successfully!');
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete task';
      toast.error(errorMessage);
      throw error;
    }
  };
};
