import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

/**
 * Get student progress data for educator view with molecules visualization
 * @param {string} studentId - The student's user profile ID
 * @returns {Promise} Response containing completed, in-progress, and unearned atoms
 */
export const getEducatorStudentProgress = async studentId => {
  try {
    const response = await axios.get(ENDPOINTS.PROGRESS_EDUCATOR_STUDENT(studentId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all education tasks for a student
 * @param {string} studentId - The student's user profile ID
 * @returns {Promise} Response containing student's tasks
 */
export const getStudentTasks = async studentId => {
  try {
    const response = await axios.get(ENDPOINTS.EDUCATION_TASKS_BY_STUDENT(studentId));
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update education task status
 * @param {string} taskId - The task ID
 * @param {string} status - New status (assigned, in_progress, completed, graded)
 * @returns {Promise} Response containing updated task
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await axios.patch(ENDPOINTS.EDUCATION_TASK_STATUS(taskId), { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit task uploads
 * @param {string} taskId - The task ID
 * @param {Array<string>} uploadUrls - Array of upload URLs
 * @returns {Promise} Response containing updated task
 */
export const submitTaskUploads = async (taskId, uploadUrls) => {
  try {
    const response = await axios.patch(ENDPOINTS.EDUCATION_TASK(taskId), {
      uploadUrls,
      status: 'completed',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
