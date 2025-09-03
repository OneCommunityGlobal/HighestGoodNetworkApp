import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_APIENDPOINT || 'http://localhost:4500/api';

/**
 * Fetch all available projects
 * @returns {Promise<Array>} Array of projects
 */
export const fetchProjects = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: token },
    });

    return response.data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
};

/**
 * Fetch planned cost breakdown for a specific project
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Planned cost breakdown data
 */
export const fetchPlannedCostBreakdown = async projectId => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      `${API_BASE_URL}/projects/${projectId}/planned-cost-breakdown`,
      {
        headers: { Authorization: token },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching planned cost breakdown:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch planned cost breakdown');
  }
};

/**
 * Create or update planned cost for a project category
 * @param {string} projectId - The project ID
 * @param {string} category - The category (Plumbing, Electrical, Structural, Mechanical)
 * @param {number} plannedCost - The planned cost amount
 * @returns {Promise<Object>} Response data
 */
export const createOrUpdatePlannedCost = async (projectId, category, plannedCost) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_BASE_URL}/projects/${projectId}/planned-costs`,
      {
        category,
        plannedCost,
      },
      {
        headers: { Authorization: token },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error creating/updating planned cost:', error);
    throw new Error(error.response?.data?.message || 'Failed to create/update planned cost');
  }
};

/**
 * Delete planned cost for a project category
 * @param {string} projectId - The project ID
 * @param {string} category - The category to delete
 * @returns {Promise<Object>} Response data
 */
export const deletePlannedCost = async (projectId, category) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete(
      `${API_BASE_URL}/projects/${projectId}/planned-costs/${category}`,
      {
        headers: { Authorization: token },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting planned cost:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete planned cost');
  }
};

/**
 * Get all planned costs for a project (detailed view)
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of planned cost records
 */
export const getAllPlannedCostsForProject = async projectId => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/planned-costs`, {
      headers: { Authorization: token },
    });

    return response.data || [];
  } catch (error) {
    console.error('Error fetching all planned costs:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch planned costs');
  }
};
