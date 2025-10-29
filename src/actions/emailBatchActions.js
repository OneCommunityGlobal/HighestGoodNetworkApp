import httpService from '../services/httpService';
import { toast } from 'react-toastify';

// Action Types
export const EMAIL_BATCH_ACTIONS = {
  FETCH_BATCHES_START: 'FETCH_BATCHES_START',
  FETCH_BATCHES_SUCCESS: 'FETCH_BATCHES_SUCCESS',
  FETCH_BATCHES_ERROR: 'FETCH_BATCHES_ERROR',

  FETCH_DASHBOARD_STATS_START: 'FETCH_DASHBOARD_STATS_START',
  FETCH_DASHBOARD_STATS_SUCCESS: 'FETCH_DASHBOARD_STATS_SUCCESS',
  FETCH_DASHBOARD_STATS_ERROR: 'FETCH_DASHBOARD_STATS_ERROR',

  FETCH_BATCH_AUDIT_START: 'FETCH_BATCH_AUDIT_START',
  FETCH_BATCH_AUDIT_SUCCESS: 'FETCH_BATCH_AUDIT_SUCCESS',
  FETCH_BATCH_AUDIT_ERROR: 'FETCH_BATCH_AUDIT_ERROR',

  FETCH_ITEM_AUDIT_START: 'FETCH_ITEM_AUDIT_START',
  FETCH_ITEM_AUDIT_SUCCESS: 'FETCH_ITEM_AUDIT_SUCCESS',
  FETCH_ITEM_AUDIT_ERROR: 'FETCH_ITEM_AUDIT_ERROR',

  FETCH_AUDIT_STATS_START: 'FETCH_AUDIT_STATS_START',
  FETCH_AUDIT_STATS_SUCCESS: 'FETCH_AUDIT_STATS_SUCCESS',
  FETCH_AUDIT_STATS_ERROR: 'FETCH_AUDIT_STATS_ERROR',
};

// Fetch batches
export const fetchBatches = (filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_BATCHES_START });

    const response = await httpService.get('/api/email-batches/batches', { params: filters });

    if (response.data.success) {
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_BATCHES_SUCCESS,
        payload: response.data.data,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch batches');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch batches';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_BATCHES_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Fetch dashboard stats
export const fetchDashboardStats = () => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_DASHBOARD_STATS_START });

    const response = await httpService.get('/api/email-batches/dashboard');

    if (response.data.success) {
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_DASHBOARD_STATS_SUCCESS,
        payload: response.data.data,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch dashboard stats');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard stats';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_DASHBOARD_STATS_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Fetch email audit trail
export const fetchEmailAuditTrail = (emailId, filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_BATCH_AUDIT_START });

    const response = await httpService.get(`/api/email-batches/audit/email/${emailId}`, { params: filters });

    if (response.data.success) {
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_BATCH_AUDIT_SUCCESS,
        payload: response.data.data,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch email audit trail');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch email audit trail';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_BATCH_AUDIT_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Fetch email batch item audit trail
export const fetchEmailBatchAuditTrail = (emailBatchId, filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_ITEM_AUDIT_START });

    const response = await httpService.get(`/api/email-batches/audit/email-batch/${emailBatchId}`, { params: filters });

    if (response.data.success) {
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_ITEM_AUDIT_SUCCESS,
        payload: response.data.data,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch email batch audit trail');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch email batch audit trail';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_ITEM_AUDIT_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Fetch audit statistics
export const fetchAuditStats = (filters = {}) => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_AUDIT_STATS_START });

    const response = await httpService.get('/api/email-batches/audit/stats', { params: filters });

    if (response.data.success) {
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_AUDIT_STATS_SUCCESS,
        payload: response.data.data,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch audit stats');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch audit stats';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_AUDIT_STATS_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};