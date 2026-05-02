import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

/**
 * Fetches all available project IDs with cost tracking data
 * @returns {Promise<Array>} Array of project IDs
 */
export const getProjectIds = async () => {
  const response = await axios.get(ENDPOINTS.PROJECT_COST_IDS);
  return response.data.projectIds || [];
};

/**
 * Fetches cost data for a specific project
 * @param {string} projectId - The ID of the project
 * @param {Object} options - Optional parameters
 * @param {string} options.categories - Comma-separated list of categories to filter by
 * @param {string} options.fromDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} options.toDate - End date for filtering (YYYY-MM-DD)
 * @returns {Promise<Object>} Cost data including actual and predicted costs
 */
export const getProjectCosts = async (projectId, options = {}) => {
  const { categories, fromDate, toDate } = options;
  const response = await axios.get(
    ENDPOINTS.PROJECT_COSTS_BY_ID(projectId, categories, fromDate, toDate),
  );
  return response.data;
};

export default {
  getProjectIds,
  getProjectCosts,
};
