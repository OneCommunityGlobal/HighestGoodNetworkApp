import httpService from '../services/httpService';
import { toast } from 'react-toastify';

// Action Types
// Note: EMAIL = parent Email record, EMAIL_BATCH = child EmailBatch item
export const EMAIL_OUTBOX_ACTIONS = {
  FETCH_EMAILS_START: 'FETCH_EMAILS_START',
  FETCH_EMAILS_SUCCESS: 'FETCH_EMAILS_SUCCESS',
  FETCH_EMAILS_ERROR: 'FETCH_EMAILS_ERROR',
  // Audit trail actions kept for backward compatibility but return empty arrays
  FETCH_EMAIL_AUDIT_START: 'FETCH_EMAIL_AUDIT_START',
  FETCH_EMAIL_AUDIT_SUCCESS: 'FETCH_EMAIL_AUDIT_SUCCESS',
  FETCH_EMAIL_AUDIT_ERROR: 'FETCH_EMAIL_AUDIT_ERROR',
  FETCH_EMAIL_BATCH_AUDIT_START: 'FETCH_EMAIL_BATCH_AUDIT_START',
  FETCH_EMAIL_BATCH_AUDIT_SUCCESS: 'FETCH_EMAIL_BATCH_AUDIT_SUCCESS',
  FETCH_EMAIL_BATCH_AUDIT_ERROR: 'FETCH_EMAIL_BATCH_AUDIT_ERROR',
};

// Fetch emails (parent Email records) - Outbox list
// Backend returns: { success: true, data: emails[] }
export const fetchEmails = () => async (dispatch) => {
  try {
    dispatch({ type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_START });

    const response = await httpService.get('/api/email-outbox');

    if (response.data.success) {
      // Backend returns data as array directly
      const emails = Array.isArray(response.data.data) ? response.data.data : [];
      
      dispatch({
        type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_SUCCESS,
        payload: emails,
      });

      return emails;
    } else {
      throw new Error(response.data.message || 'Failed to fetch emails');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch emails';
    dispatch({
      type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_ERROR,
      payload: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  }
};

// Alias for backward compatibility
export const fetchBatches = fetchEmails;

// Audit trail functions - deprecated (audit logging removed from backend)
// Error details are now captured directly in EmailBatch records (lastError, errorCode, etc.)
// These functions return empty arrays for backward compatibility
export const fetchEmailAuditTrail = (emailId) => async (dispatch) => {
  dispatch({ type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_AUDIT_START });
  // Audit trail removed - return empty array
  dispatch({
    type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_AUDIT_SUCCESS,
    payload: [],
  });
  return [];
};

export const fetchEmailBatchAuditTrail = (emailBatchId) => async (dispatch) => {
  dispatch({ type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_START });
  // Audit trail removed - return empty array
  dispatch({
    type: EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_SUCCESS,
    payload: [],
  });
  return [];
};

// Resend email with selected recipient option
// Backend endpoint: POST /api/resend-email
// Backend returns: { success: true, message: '...', data: { emailId: '...', recipientCount: ... } }
export const resendEmail = (emailId, recipientOption, specificRecipients = []) => async (dispatch, getState) => {
  try {
    // Get current user for requestor (required by backend)
    const state = getState();
    const currentUser = state.auth?.user;
    
    if (!currentUser || !currentUser.userid) {
      throw new Error('User authentication required to resend emails');
    }

    const requestor = {
      requestorId: currentUser.userid,
      email: currentUser.email,
      role: currentUser.role,
    };

    const response = await httpService.post('/api/resend-email', {
      emailId,
      recipientOption,
      specificRecipients: Array.isArray(specificRecipients) ? specificRecipients : [],
      requestor,
    });

    if (response.data.success) {
      const message = response.data.message || 'Email created for resend successfully. Processing started.';
      toast.success(message);
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

