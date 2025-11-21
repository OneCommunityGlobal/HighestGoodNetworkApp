import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

const API_BASE_URL = ENDPOINTS.BASE_URL;

/**
 * Fetches student progress data including task, subject, unit, and overall progress
 * @param {Object} params - Query parameters
 * @param {string} params.studentId - The ID of the student
 * @returns {Promise<Object>} Progress data with tasks, subjects, units, and overall stats
 */
export async function getStudentProgress({ studentId }) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/educationtask/student/progress`, {
      params: { studentId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student progress:', error);
    throw error;
  }
}

/**
 * Marks a task as complete
 * @param {Object} params - Request body parameters
 * @param {string} params.studentId - The ID of the student
 * @param {string} params.taskId - The ID of the task to mark complete
 * @param {string} params.status - Optional status (default: 'completed')
 * @returns {Promise<Object>} Response from the server
 */
export async function markTaskComplete({ studentId, taskId, status = 'completed' }) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/educationtask/student/mark-complete`, {
      studentId,
      taskId,
      status,
      requestor: {
        requestorId: studentId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error marking task complete:', error);
    throw error;
  }
}
