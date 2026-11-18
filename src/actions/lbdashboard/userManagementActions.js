import httpService from '../../services/httpService';
import config from '../../config.json';
import { ENDPOINTS } from '../../utils/URL';
import {
  FETCH_LB_USERS_REQUEST,
  FETCH_LB_USERS_SUCCESS,
  FETCH_LB_USERS_FAILURE,
  UPDATE_LB_USER_REQUEST,
  UPDATE_LB_USER_SUCCESS,
  UPDATE_LB_USER_FAILURE,
  DELETE_LB_USER_REQUEST,
  DELETE_LB_USER_SUCCESS,
  DELETE_LB_USER_FAILURE,
  SET_LB_USERS_PAGE,
  SET_LB_USERS_LIMIT,
  SET_LB_USERS_SEARCH,
  CLEAR_LB_USERS_ERROR,
} from '../../constants/lbDashboard/userManagementConstants';

const { tokenKey } = config;

/**
 * Retrieves the administrator's JWT token and formats it as a Bearer token.
 * @returns {string} Formatted Bearer token or empty string
 */
export const getBearerToken = () => {
  const rawToken = localStorage.getItem(tokenKey) || localStorage.getItem('lbToken') || '';
  const trimmed = String(rawToken).trim();
  if (!trimmed) return '';
  return trimmed.startsWith('Bearer ') ? trimmed : `Bearer ${trimmed}`;
};

/**
 * Builds request headers with the administrator's Bearer token attached.
 * @returns {Object} Headers object with Authorization if token exists
 */
export const getAuthHeaders = () => {
  const bearerToken = getBearerToken();
  if (bearerToken) {
    httpService.setjwt(bearerToken);
    return { Authorization: bearerToken };
  }
  return {};
};

/**
 * Extracts a descriptive error message and HTTP status code from an API error.
 * @param {Error} error - Axios or network error
 * @param {string} fallbackMessage - Default message if none provided
 * @returns {{ status: number|null, message: string }}
 */
export const parseApiError = (error, fallbackMessage) => {
  const status = error?.response?.status || null;
  const data = error?.response?.data;
  const serverMessage = data?.message || data?.error || (typeof data === 'string' ? data : null);

  if (status === 401) {
    return {
      status: 401,
      message:
        serverMessage ||
        '401 Unauthorized: Your session has expired or is invalid. Please log in again.',
    };
  }

  if (status === 403) {
    return {
      status: 403,
      message:
        serverMessage ||
        '403 Forbidden: Access Denied. Administrator privileges are required to manage users.',
    };
  }

  return {
    status,
    message: serverMessage || error?.message || fallbackMessage,
  };
};

/**
 * Normalizes backend pagination/users response structures.
 * @param {Object|Array} rawData - Response body from GET /lbdashboard/admin/users
 * @param {number} requestedPage
 * @param {number} requestedLimit
 * @returns {{ users: Array, page: number, limit: number, total: number, totalPages: number }}
 */
export const normalizeUsersResponse = (rawData, requestedPage = 1, requestedLimit = 10) => {
  if (Array.isArray(rawData)) {
    const total = rawData.length;
    const safeLimit = Number(requestedLimit) || 10;
    return {
      users: rawData,
      page: Number(requestedPage) || 1,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  }

  const payload = rawData?.data && !Array.isArray(rawData.data) ? rawData.data : rawData || {};
  const pagination = payload.pagination || {};
  const users = payload.users || payload.items || payload.results || payload.data || [];

  const limit = Number(payload.limit || pagination.limit || requestedLimit || 10);
  const page = Number(payload.page || pagination.page || requestedPage || 1);
  const total = Number(payload.total ?? pagination.total ?? users.length);
  const totalPages = Math.max(
    1,
    Number(payload.totalPages || pagination.totalPages || Math.ceil(total / limit) || 1),
  );

  return {
    users: Array.isArray(users) ? users : [],
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Fetches paginated and filtered users from GET /lbdashboard/admin/users
 */
export const fetchLBUsers = ({ page = 1, limit = 10, search = '' } = {}) => async dispatch => {
  dispatch({ type: FETCH_LB_USERS_REQUEST, payload: { page, limit, search } });

  try {
    const headers = getAuthHeaders();
    const url = ENDPOINTS.LB_ADMIN_USERS(page, limit, search);
    const response = await httpService.get(url, { headers });
    const normalized = normalizeUsersResponse(response?.data, page, limit);

    dispatch({
      type: FETCH_LB_USERS_SUCCESS,
      payload: {
        ...normalized,
        search,
      },
    });

    return {
      success: true,
      data: normalized,
    };
  } catch (error) {
    const { status, message } = parseApiError(error, 'Failed to fetch users.');
    dispatch({
      type: FETCH_LB_USERS_FAILURE,
      payload: { message, status },
    });
    return {
      success: false,
      status,
      message,
      error,
    };
  }
};

/**
 * Updates user details via PATCH /lbdashboard/admin/users/:id
 */
export const updateLBUser = (userId, userData) => async dispatch => {
  dispatch({ type: UPDATE_LB_USER_REQUEST, payload: { userId } });

  try {
    const headers = getAuthHeaders();
    const url = ENDPOINTS.LB_ADMIN_USER_BY_ID(userId);
    const response = await httpService.patch(url, userData, { headers });
    const responseBody = response?.data || {};
    const extractedUser = responseBody.user || responseBody.data || responseBody;

    const updatedUser = {
      ...userData,
      ...(typeof extractedUser === 'object' ? extractedUser : {}),
      _id: extractedUser?._id || extractedUser?.id || userId,
    };

    dispatch({
      type: UPDATE_LB_USER_SUCCESS,
      payload: { userId, updatedUser },
    });

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    const { status, message } = parseApiError(error, 'Failed to update user details.');
    dispatch({
      type: UPDATE_LB_USER_FAILURE,
      payload: { message, status },
    });
    return {
      success: false,
      status,
      message,
      error,
    };
  }
};

/**
 * Deletes a user via DELETE /lbdashboard/admin/users/:id
 */
export const deleteLBUser = userId => async dispatch => {
  dispatch({ type: DELETE_LB_USER_REQUEST, payload: { userId } });

  try {
    const headers = getAuthHeaders();
    const url = ENDPOINTS.LB_ADMIN_USER_BY_ID(userId);
    await httpService.delete(url, { headers });

    dispatch({
      type: DELETE_LB_USER_SUCCESS,
      payload: userId,
    });

    return {
      success: true,
      userId,
    };
  } catch (error) {
    const { status, message } = parseApiError(error, 'Failed to delete user.');
    dispatch({
      type: DELETE_LB_USER_FAILURE,
      payload: { message, status },
    });
    return {
      success: false,
      status,
      message,
      error,
    };
  }
};

export const setLBUsersPage = page => ({
  type: SET_LB_USERS_PAGE,
  payload: page,
});

export const setLBUsersLimit = limit => ({
  type: SET_LB_USERS_LIMIT,
  payload: limit,
});

export const setLBUsersSearch = search => ({
  type: SET_LB_USERS_SEARCH,
  payload: search,
});

export const clearLBUsersError = () => ({
  type: CLEAR_LB_USERS_ERROR,
});
