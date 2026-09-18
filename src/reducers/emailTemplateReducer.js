import { EMAIL_TEMPLATE_ACTIONS } from '../actions/emailTemplateActions';

const initialState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  searchTerm: '',
  // sendingEmail and emailSent removed - templates are now sent via emailController endpoints
  preview: {
    data: null,
    loading: false,
    error: null,
  },
  validation: {
    isValid: null,
    errors: [],
    loading: false,
    error: null,
  },
};

const emailTemplateReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch all templates
    case EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_SUCCESS:
      return {
        ...state,
        loading: false,
        templates: action.payload,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        templates: [],
      };

    // Fetch single template
    case EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        currentTemplate: action.payload,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.FETCH_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
        currentTemplate: null,
      };

    // Create template
    case EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        templates: [action.payload, ...state.templates],
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.CREATE_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update template
    case EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        templates: state.templates.map(template =>
          template._id === action.payload._id ? action.payload : template,
        ),
        currentTemplate: action.payload,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.UPDATE_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Delete template
    case EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_SUCCESS:
      return {
        ...state,
        loading: false,
        templates: state.templates.filter(template => template._id !== action.payload),
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Send email actions removed - templates are now rendered client-side
    // and sent via emailController endpoints (sendEmail/broadcastEmail)

    // Set search term
    case EMAIL_TEMPLATE_ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
      };

    case EMAIL_TEMPLATE_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      };

    case EMAIL_TEMPLATE_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };

    // Clear error
    case EMAIL_TEMPLATE_ACTIONS.CLEAR_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        error: null,
        emailSent: false,
      };

    // Clear current template
    case EMAIL_TEMPLATE_ACTIONS.CLEAR_CURRENT_TEMPLATE:
      return {
        ...state,
        currentTemplate: null,
        error: null,
      };

    // Preview template
    case EMAIL_TEMPLATE_ACTIONS.PREVIEW_EMAIL_TEMPLATE_START:
      return {
        ...state,
        preview: {
          ...state.preview,
          loading: true,
          error: null,
        },
      };

    case EMAIL_TEMPLATE_ACTIONS.PREVIEW_EMAIL_TEMPLATE_SUCCESS:
      return {
        ...state,
        preview: {
          data: action.payload,
          loading: false,
          error: null,
        },
      };

    case EMAIL_TEMPLATE_ACTIONS.PREVIEW_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        preview: {
          ...state.preview,
          loading: false,
          error: action.payload,
        },
      };

    // Validate template
    case EMAIL_TEMPLATE_ACTIONS.VALIDATE_EMAIL_TEMPLATE_START:
      return {
        ...state,
        validation: {
          ...state.validation,
          loading: true,
          error: null,
        },
      };

    case EMAIL_TEMPLATE_ACTIONS.VALIDATE_EMAIL_TEMPLATE_SUCCESS:
      return {
        ...state,
        validation: {
          isValid: action.payload.isValid,
          errors: action.payload.errors || [],
          loading: false,
          error: null,
        },
      };

    case EMAIL_TEMPLATE_ACTIONS.VALIDATE_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        validation: {
          ...state.validation,
          loading: false,
          error: action.payload,
        },
      };

    default:
      return state;
  }
};

export default emailTemplateReducer;
