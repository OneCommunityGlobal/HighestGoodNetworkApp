import axios from 'axios';
import httpService from '~/services/httpService';
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
    const { type = '', location = '', page = 1, limit = 9, sortBy = 'date', userId = '' } = params;
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('userId', userId);
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

export async function joinWaitlist(eventId, userId, token) {
  const url = `${ENDPOINTS.EVENTS}/${eventId}/waitlist`;

  return axios.post(
    url,
    { userId },
    {
      headers: {
        Authorization: token,
      },
    }
  );
}

export async function leaveWaitlist(eventId, userId, token) {
  const url = `${ENDPOINTS.EVENTS}/${eventId}/waitlist`;

  return axios.delete(url, {
    data: { userId },
    headers: {
      Authorization: token,
    },
  });
}

export async function getPopularityMetrics(startDate, endDate) {
  try {
    const url = ENDPOINTS.EVENT_POPULARITY(startDate, endDate);
    const response = await httpService.get(url);
    return Promise.resolve(response);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch popularity metrics';
    return {
      message: errorMessage,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getEngagementMetrics(startDate, endDate, format) {
  try {
    const url = ENDPOINTS.EVENT_ENGAGEMENT(startDate, endDate, format);
    const response = await httpService.get(url);
    return Promise.resolve(response);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch engagement metrics';
    return {
      message: errorMessage,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getEventValue(startDate, endDate) {
  try {
    const url = ENDPOINTS.EVENT_VALUE(startDate, endDate);
    const response = await httpService.get(url);
    return Promise.resolve(response);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch event value';
    return {
      message: errorMessage,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getFormatComparison(startDate, endDate) {
  try {
    const url = ENDPOINTS.EVENT_FORMAT_COMPARISON(startDate, endDate);
    const response = await httpService.get(url);
    return Promise.resolve(response);
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch format comparison';
    return {
      message: errorMessage,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}
