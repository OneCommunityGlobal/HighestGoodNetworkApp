import { EMAIL_TEMPLATE_ACTIONS } from '../actions/emailTemplateActions';

const initialState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  searchTerm: '',
  totalCount: 0,
  sendingEmail: false,
  emailSent: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    limit: null,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    sortBy: 'created_at',
    sortOrder: 'desc',
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
        templates: action.payload.templates,
        totalCount: action.payload.pagination.totalCount,
        pagination: action.payload.pagination,
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
        totalCount: state.totalCount + 1,
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
        totalCount: state.totalCount - 1,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.DELETE_EMAIL_TEMPLATE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Send email
    case EMAIL_TEMPLATE_ACTIONS.SEND_EMAIL_START:
      return {
        ...state,
        sendingEmail: true,
        emailSent: false,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.SEND_EMAIL_SUCCESS:
      return {
        ...state,
        sendingEmail: false,
        emailSent: true,
        error: null,
      };

    case EMAIL_TEMPLATE_ACTIONS.SEND_EMAIL_ERROR:
      return {
        ...state,
        sendingEmail: false,
        emailSent: false,
        error: action.payload,
      };

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

    default:
      return state;
  }
};

export default emailTemplateReducer;
