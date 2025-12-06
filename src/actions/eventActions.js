import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';

export async function getEvents(filters = {}) {
  try {
    const url = ENDPOINTS.EVENTS;
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 9,
      type: filters.type || '',
      location: filters.location || '',
    };
    const response = await httpService.get(url, { params });
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getEventTypes() {
  try {
    const url = ENDPOINTS.EVENT_TYPES;
    const response = await httpService.get(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getEventLocations() {
  try {
    const url = ENDPOINTS.EVENT_LOCATIONS;
    const response = await httpService.get(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
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
