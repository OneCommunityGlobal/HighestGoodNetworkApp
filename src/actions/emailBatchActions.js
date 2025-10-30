import httpService from '../services/httpService';
import { toast } from 'react-toastify';

// Action Types
// Note: EMAIL = parent Email record, EMAIL_BATCH = child EmailBatch item
export const EMAIL_BATCH_ACTIONS = {
  FETCH_EMAILS_START: 'FETCH_EMAILS_START',
  FETCH_EMAILS_SUCCESS: 'FETCH_EMAILS_SUCCESS',
  FETCH_EMAILS_ERROR: 'FETCH_EMAILS_ERROR',

  FETCH_EMAIL_AUDIT_START: 'FETCH_EMAIL_AUDIT_START',
  FETCH_EMAIL_AUDIT_SUCCESS: 'FETCH_EMAIL_AUDIT_SUCCESS',
  FETCH_EMAIL_AUDIT_ERROR: 'FETCH_EMAIL_AUDIT_ERROR',

  FETCH_EMAIL_BATCH_AUDIT_START: 'FETCH_EMAIL_BATCH_AUDIT_START',
  FETCH_EMAIL_BATCH_AUDIT_SUCCESS: 'FETCH_EMAIL_BATCH_AUDIT_SUCCESS',
  FETCH_EMAIL_BATCH_AUDIT_ERROR: 'FETCH_EMAIL_BATCH_AUDIT_ERROR',

};

// Fetch emails (parent Email records)
export const fetchEmails = () => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_EMAILS_START });

    const response = await httpService.get('/api/email-batches/emails');

    if (response.data.success) {
      // Handle both array response and wrapped response with pagination
      const emails = Array.isArray(response.data.data)
        ? response.data.data 
        : (response.data.data?.emails || []);
      
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_EMAILS_SUCCESS,
        payload: emails,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch emails');
    }

    return Array.isArray(response.data.data) 
      ? response.data.data 
      : (response.data.data?.emails || []);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch emails';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_EMAILS_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Alias for backward compatibility
export const fetchBatches = fetchEmails;


// Fetch email audit trail (for parent Email record)
export const fetchEmailAuditTrail = (emailId) => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_EMAIL_AUDIT_START });

    const response = await httpService.get(`/api/email-batches/audit/email/${emailId}`);

    if (response.data.success) {
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_EMAIL_AUDIT_SUCCESS,
        payload: response.data.data,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch email audit trail');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch email audit trail';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_EMAIL_AUDIT_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Fetch email batch audit trail (for child EmailBatch item)
export const fetchEmailBatchAuditTrail = (emailBatchId) => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_BATCH_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_START });

    const response = await httpService.get(`/api/email-batches/audit/email-batch/${emailBatchId}`);

    if (response.data.success) {
      dispatch({
        type: EMAIL_BATCH_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_SUCCESS,
        payload: response.data.data,
      });
    } else {
      throw new Error(response.data.message || 'Failed to fetch email batch audit trail');
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch email batch audit trail';
    dispatch({
      type: EMAIL_BATCH_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Resend email with selected recipient option
export const resendEmail = (emailId, recipientOption, specificRecipients = []) => async (dispatch) => {
  try {
    const response = await httpService.post('/api/resend-email', {
      emailId,
      recipientOption,
      specificRecipients,
    });

    if (response.data.success) {
      toast.success(response.data.message || 'Email resent successfully');
      // Refresh the emails list
      await dispatch(fetchEmails());
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to resend email');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to resend email';
    toast.error(errorMessage);
    throw error;
  }
};

// Fetch worker status
export const fetchWorkerStatus = async () => {
  try {
    const response = await httpService.get('/api/email-batches/worker-status');
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error('Error fetching worker status:', error);
    return null;
  }
};
