import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

/**
 * Fetch events with optional filtering
 * @param {Object} params - Query parameters
 * @param {string} params.type - Filter by event type
 * @param {string} params.location - Filter by location
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field
 * @returns {Promise} API response
 */
export async function getEvents(params = {}) {
  try {
    const { type = '', location = '', page = 1, limit = 9, sortBy = 'date' } = params;
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (location) queryParams.append('location', location);
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sortBy', sortBy);

    const url = `${ENDPOINTS.EVENTS}?${queryParams.toString()}`;
    const response = await axios.get(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

/**
 * Fetch available event types
 * @returns {Promise} API response
 */
export async function getEventTypes() {
  try {
    const url = ENDPOINTS.EVENT_TYPES;
    const response = await axios.get(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

/**
 * Fetch available event locations
 * @returns {Promise} API response
 */
export async function getEventLocations() {
  try {
    const url = ENDPOINTS.EVENT_LOCATIONS;
    const response = await axios.get(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}
