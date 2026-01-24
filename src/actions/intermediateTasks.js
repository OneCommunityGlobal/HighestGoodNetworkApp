import { toast } from 'react-toastify';
import httpService from '../services/httpService';
import { updateStudentTask } from './studentTasks';

/**
 * Action types for intermediate tasks
 */
export const FETCH_INTERMEDIATE_TASKS_START = 'FETCH_INTERMEDIATE_TASKS_START';
export const FETCH_INTERMEDIATE_TASKS_SUCCESS = 'FETCH_INTERMEDIATE_TASKS_SUCCESS';
export const FETCH_INTERMEDIATE_TASKS_ERROR = 'FETCH_INTERMEDIATE_TASKS_ERROR';
export const CREATE_INTERMEDIATE_TASK_SUCCESS = 'CREATE_INTERMEDIATE_TASK_SUCCESS';
export const UPDATE_INTERMEDIATE_TASK_SUCCESS = 'UPDATE_INTERMEDIATE_TASK_SUCCESS';
export const DELETE_INTERMEDIATE_TASK_SUCCESS = 'DELETE_INTERMEDIATE_TASK_SUCCESS';
export const MARK_INTERMEDIATE_TASK_DONE = 'MARK_INTERMEDIATE_TASK_DONE';

/**
 * Fetch intermediate tasks for a parent task
 */
export const fetchIntermediateTasks = (taskId) => {
  return async (dispatch) => {
    try {
      const response = await httpService.get(ENDPOINTS.INTERMEDIATE_TASKS_BY_PARENT(taskId));
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch sub-tasks');
      throw error;
    }
  };
};

/**
 * Calculate total expected hours from intermediate tasks
 */
const calculateTotalExpectedHours = (intermediateTasks) => {
  return intermediateTasks.reduce((total, task) => {
    return total + (task.expected_hours || 0);
  }, 0);
};

const updateParentTaskExpectedHours = async (dispatch, getState, parentTaskId) => {
  try {
    // Fetch all intermediate tasks for this parent
    const intermediateTasks = await dispatch(fetchIntermediateTasks(parentTaskId));

    // Calculate total expected hours
    const totalExpectedHours = calculateTotalExpectedHours(intermediateTasks);

    // Get the parent task from state
    const state = getState();
    const parentTask = state.studentTasks.taskItems.find(t => t.id === parentTaskId);

    if (parentTask) {
      // Update the parent task with new expected hours
      dispatch(updateStudentTask(parentTaskId, {
        ...parentTask,
        suggested_total_hours: totalExpectedHours
      }));
    }
  } catch (error) {
    toast.error('Failed to update parent task hours');
  }
};

/**
 * Create a new intermediate task
 * @param {Object} taskData - The task data to create
 */
export const createIntermediateTask = (taskData) => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const userId = state.auth.user.userid;

      // Update parent task expected hours
      if (taskData.parentTaskId) {
        await updateParentTaskExpectedHours(dispatch, getState, taskData.parentTaskId);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create sub-task';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };
};

      if (response.data.success) {
        toast.success('Task created successfully!');
        return response.data.task;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update sub-task';
      toast.error(`Error: ${errorMessage}`);
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

      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete sub-task';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };
};

/**
 * Mark an intermediate task as done (for students)
 */
export const markIntermediateTaskAsDone = (id, parentTaskId) => {
  return async (dispatch) => {
    try {
      // First, fetch the current task data
      const currentTask = await httpService.get(ENDPOINTS.INTERMEDIATE_TASK_BY_ID(id));

      // Update with the completed status while preserving all required fields
      const response = await httpService.put(ENDPOINTS.INTERMEDIATE_TASK_BY_ID(id), {
        ...currentTask.data,
        status: 'completed'
      });
      toast.success('Sub-task marked as done');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to mark sub-task as done';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };
};
