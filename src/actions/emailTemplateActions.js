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

  // Deprecated: sending emails from templates handled by emailController endpoints
  SEND_EMAIL_START: 'SEND_EMAIL_START',
  SEND_EMAIL_SUCCESS: 'SEND_EMAIL_SUCCESS',
  SEND_EMAIL_ERROR: 'SEND_EMAIL_ERROR',

  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_EMAIL_TEMPLATE_ERROR: 'CLEAR_EMAIL_TEMPLATE_ERROR',
  CLEAR_CURRENT_TEMPLATE: 'CLEAR_CURRENT_TEMPLATE',
};

// Action Creators

// Fetch all email templates with pagination and sorting
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
    if (includeEmailContent) params.append('includeEmailContent', 'true');

    const response = await axios.get(`${ENDPOINTS.EMAIL_TEMPLATES}?${params.toString()}`);

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_SUCCESS,
      payload: response.data.templates,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch email templates';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Fetch single email template
export const fetchEmailTemplate = id => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_START });

    const response = await axios.get(`${ENDPOINTS.EMAIL_TEMPLATES}/${id}`);

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_SUCCESS,
      payload: response.data.template,
    });

    return response.data.template;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch email template';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Create email template
export const createEmailTemplate = templateData => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_START });

    const response = await axios.post(ENDPOINTS.EMAIL_TEMPLATES, templateData);

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_SUCCESS,
      payload: response.data.template,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create email template';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Update email template
export const updateEmailTemplate = (id, templateData) => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_START });

    const response = await axios.put(`${ENDPOINTS.EMAIL_TEMPLATES}/${id}`, templateData);

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_SUCCESS,
      payload: response.data.template,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update email template';
    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_ERROR,
      payload: errorMessage,
    });
    throw error;
  }
};

// Delete email template
export const deleteEmailTemplate = id => async dispatch => {
  try {
    dispatch({ type: EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_START });

    await axios.delete(`${ENDPOINTS.EMAIL_TEMPLATES}/${id}`);

    dispatch({
      type: EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_SUCCESS,
      payload: id,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete email template';
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
