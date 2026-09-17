import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

// Action Types
export const EMAIL_TEMPLATE_ACTIONS = {
  FETCH_EMAIL_TEMPLATES_START: 'FETCH_EMAIL_TEMPLATES_START',
  FETCH_EMAIL_TEMPLATES_SUCCESS: 'FETCH_EMAIL_TEMPLATES_SUCCESS',
  FETCH_EMAIL_TEMPLATES_ERROR: 'FETCH_EMAIL_TEMPLATES_ERROR',

  FETCH_EMAIL_TEMPLATE_START: 'FETCH_EMAIL_TEMPLATE_START',
  FETCH_EMAIL_TEMPLATE_SUCCESS: 'FETCH_EMAIL_TEMPLATE_SUCCESS',
  FETCH_EMAIL_TEMPLATE_ERROR: 'FETCH_EMAIL_TEMPLATE_ERROR',

  CREATE_EMAIL_TEMPLATE_START: 'CREATE_EMAIL_TEMPLATE_START',
  CREATE_EMAIL_TEMPLATE_SUCCESS: 'CREATE_EMAIL_TEMPLATE_SUCCESS',
  CREATE_EMAIL_TEMPLATE_ERROR: 'CREATE_EMAIL_TEMPLATE_ERROR',

  UPDATE_EMAIL_TEMPLATE_START: 'UPDATE_EMAIL_TEMPLATE_START',
  UPDATE_EMAIL_TEMPLATE_SUCCESS: 'UPDATE_EMAIL_TEMPLATE_SUCCESS',
  UPDATE_EMAIL_TEMPLATE_ERROR: 'UPDATE_EMAIL_TEMPLATE_ERROR',

  DELETE_EMAIL_TEMPLATE_START: 'DELETE_EMAIL_TEMPLATE_START',
  DELETE_EMAIL_TEMPLATE_SUCCESS: 'DELETE_EMAIL_TEMPLATE_SUCCESS',
  DELETE_EMAIL_TEMPLATE_ERROR: 'DELETE_EMAIL_TEMPLATE_ERROR',

  PREVIEW_EMAIL_TEMPLATE_START: 'PREVIEW_EMAIL_TEMPLATE_START',
  PREVIEW_EMAIL_TEMPLATE_SUCCESS: 'PREVIEW_EMAIL_TEMPLATE_SUCCESS',
  PREVIEW_EMAIL_TEMPLATE_ERROR: 'PREVIEW_EMAIL_TEMPLATE_ERROR',

  VALIDATE_EMAIL_TEMPLATE_START: 'VALIDATE_EMAIL_TEMPLATE_START',
  VALIDATE_EMAIL_TEMPLATE_SUCCESS: 'VALIDATE_EMAIL_TEMPLATE_SUCCESS',
  VALIDATE_EMAIL_TEMPLATE_ERROR: 'VALIDATE_EMAIL_TEMPLATE_ERROR',

  // Send email actions removed - templates are now rendered client-side
  // and sent via emailController endpoints (sendEmail/broadcastEmail)

  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_EMAIL_TEMPLATE_ERROR: 'CLEAR_EMAIL_TEMPLATE_ERROR',
  CLEAR_CURRENT_TEMPLATE: 'CLEAR_CURRENT_TEMPLATE',
};

// Action Creators

// Fetch all email templates with pagination and sorting
// Backend returns: { success: true, templates: [...] }
export const fetchEmailTemplates = ({
  search = '',
  sortBy = 'created_at',
  includeEmailContent = false,
} = {}) => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_START });

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    params.append('includeEmailContent', includeEmailContent ? 'true' : 'false');
    const response = await axios.get(`${ENDPOINTS.EMAIL_TEMPLATES}?${params.toString()}`);

    if (response.data.success) {
      // Backend returns templates array directly
      const templates = Array.isArray(response.data.templates) ? response.data.templates : [];

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_SUCCESS,
        payload: templates,
    });

      return { templates, success: true };
    } else {
      throw new Error(response.data.message || 'Failed to fetch email templates');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch email templates';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Fetch single email template
// Backend returns: { success: true, template: {...} }
export const fetchEmailTemplate = id => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_START });

    const response = await axios.get(`${ENDPOINTS.EMAIL_TEMPLATES}/${id}`);

    if (response.data.success && response.data.template) {
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_SUCCESS,
      payload: response.data.template,
    });

    return response.data.template;
    } else {
      throw new Error(response.data.message || 'Template not found');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch email template';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Create email template
// Backend returns: { success: true, template: {...} }
export const createEmailTemplate = templateData => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_START });

    const response = await axios.post(ENDPOINTS.EMAIL_TEMPLATES, templateData);

    if (response.data.success && response.data.template) {
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_SUCCESS,
      payload: response.data.template,
    });

    return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to create email template');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create email template';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Update email template
// Backend returns: { success: true, template: {...} }
export const updateEmailTemplate = (id, templateData) => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_START });

    const response = await axios.put(`${ENDPOINTS.EMAIL_TEMPLATES}/${id}`, templateData);

    if (response.data.success && response.data.template) {
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_SUCCESS,
      payload: response.data.template,
    });

    return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to update email template');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update email template';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Delete email template
// Backend returns: { success: true, message: '...' }
export const deleteEmailTemplate = id => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_START });

    const response = await axios.delete(`${ENDPOINTS.EMAIL_TEMPLATES}/${id}`);

    if (response.data.success) {
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_SUCCESS,
      payload: id,
    });

    return { success: true };
    } else {
      throw new Error(response.data.message || 'Failed to delete email template');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete email template';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Removed: Template sending is now performed client-side by rendering variables and
// posting to send/broadcast endpoints in emailController

// Set search term
export const setSearchTerm = searchTerm => ({
  type: EMAIL_TEMPLATE_ACTIONS.SET_SEARCH_TERM,
  payload: searchTerm,
});

// Set pagination
export const setPagination = pagination => ({
  type: EMAIL_TEMPLATE_ACTIONS.SET_PAGINATION,
  payload: pagination,
});

// Set filters
export const setFilters = filters => ({
  type: EMAIL_TEMPLATE_ACTIONS.SET_FILTERS,
  payload: filters,
});

// Clear error
export const clearEmailTemplateError = () => ({
  type: EMAIL_TEMPLATE_ACTIONS.CLEAR_EMAIL_TEMPLATE_ERROR,
});

// Clear current template data
export const clearCurrentTemplate = () => ({
  type: EMAIL_TEMPLATE_ACTIONS.CLEAR_CURRENT_TEMPLATE,
});

// Preview email template with variable values
// Backend returns: { success: true, preview: { subject: string, htmlContent: string } }
export const previewEmailTemplate = (id, variables = {}) => async (dispatch, getState) => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.PREVIEW_EMAIL_TEMPLATE_START });

    // Get current user for requestor (required by backend)
    const currentUser = getState().auth.user;
    if (!currentUser || !currentUser.userid) {
      throw new Error('User authentication required to preview templates');
    }

    const requestor = {
      requestorId: currentUser.userid,
      email: currentUser.email,
      role: currentUser.role,
    };

    const response = await axios.post(ENDPOINTS.EMAIL_TEMPLATE_PREVIEW(id), {
      variables,
      requestor,
    });

    if (response.data.success && response.data.preview) {
      dispatch({
        type: EMAIL_TEMPLATE_ACTIONS.PREVIEW_EMAIL_TEMPLATE_SUCCESS,
        payload: response.data.preview,
      });

      return response.data.preview;
    } else {
      throw new Error(response.data.message || 'Failed to preview email template');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to preview email template';
    const errorDetails = error.response?.data?.errors || [];
    const missingVariables = error.response?.data?.missing || [];

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.PREVIEW_EMAIL_TEMPLATE_ERROR,
      payload: { message: errorMessage, errors: errorDetails, missing: missingVariables },
    });

    throw { message: errorMessage, errors: errorDetails, missing: missingVariables };
  }
};

// Validate email template structure
// Backend returns: { success: true, isValid: boolean, errors: [] }
export const validateEmailTemplate = id => async (dispatch, getState) => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.VALIDATE_EMAIL_TEMPLATE_START });

    // Get current user for requestor (required by backend)
    const currentUser = getState().auth.user;
    if (!currentUser || !currentUser.userid) {
      throw new Error('User authentication required to validate templates');
    }

    const requestor = {
      requestorId: currentUser.userid,
      email: currentUser.email,
      role: currentUser.role,
    };

    const response = await axios.post(ENDPOINTS.EMAIL_TEMPLATE_VALIDATE(id), {
      requestor,
    });

    if (response.data.success) {
      const validationResult = {
        isValid: response.data.isValid || false,
        errors: response.data.errors || [],
      };

      dispatch({
        type: EMAIL_TEMPLATE_ACTIONS.VALIDATE_EMAIL_TEMPLATE_SUCCESS,
        payload: validationResult,
      });

      return validationResult;
    } else {
      throw new Error(response.data.message || 'Failed to validate email template');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to validate email template';
    const errorDetails = error.response?.data?.errors || [];

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.VALIDATE_EMAIL_TEMPLATE_ERROR,
      payload: { message: errorMessage, errors: errorDetails },
    });

    throw { message: errorMessage, errors: errorDetails };
  }
};
