import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import httpService from '../services/httpService';

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
      console.error('Error fetching intermediate tasks:', error);
      toast.error('Failed to fetch sub-tasks');
      throw error;
    }
  };
};

/**
 * Create a new intermediate task
 */
export const createIntermediateTask = (taskData) => {
  return async (dispatch) => {
    try {
      const response = await httpService.post(ENDPOINTS.INTERMEDIATE_TASKS(), taskData);
      toast.success('Sub-task created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating intermediate task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create sub-task';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };
};

/**
 * Update an intermediate task
 */
export const updateIntermediateTask = (id, taskData) => {
  return async (dispatch) => {
    try {
      const response = await httpService.put(ENDPOINTS.INTERMEDIATE_TASK_BY_ID(id), taskData);
      toast.success('Sub-task updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating intermediate task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update sub-task';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };
};

/**
 * Delete an intermediate task
 */
export const deleteIntermediateTask = (id) => {
  return async (dispatch) => {
    try {
      await httpService.delete(ENDPOINTS.INTERMEDIATE_TASK_BY_ID(id));
      toast.success('Sub-task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting intermediate task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete sub-task';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };
};

/**
 * Mark an intermediate task as done (for students)
 */
export const markIntermediateTaskAsDone = (id) => {
  return async (dispatch) => {
    try {
      const response = await httpService.put(ENDPOINTS.INTERMEDIATE_TASK_BY_ID(id), {
        status: 'completed'
      });
      toast.success('Sub-task marked as done');
      return response.data;
    } catch (error) {
      console.error('Error marking intermediate task as done:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to mark sub-task as done';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  };
};

