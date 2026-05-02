/**
 * Activity Feedback Reducer
 * Manages state for activity feedback functionality
 */

import { FEEDBACK_TYPES } from '../actions/activityFeedback';

const initialState = {
  // Feedback data
  feedbacks: [],
  statistics: {
    totalCount: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },

  // Loading states
  isLoading: false,
  isSubmitting: false,
  isUpdating: false,
  isDeleting: false,
  isMarkingHelpful: false,
  isReporting: false,

  // Error states
  error: null,
  submitError: null,
  updateError: null,
  deleteError: null,
  helpfulError: null,
  reportError: null,

  // UI state
  currentFilters: {
    search: '',
    rating: 'all',
    sortBy: 'newest',
  },
};

const activityFeedbackReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch Feedback
    case FEEDBACK_TYPES.FETCH_FEEDBACK_BEGIN:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case FEEDBACK_TYPES.FETCH_FEEDBACK_SUCCESS:
      return {
        ...state,
        isLoading: false,
        feedbacks: action.payload.feedbacks,
        statistics: action.payload.statistics,
        pagination: action.payload.pagination,
        error: null,
      };

    case FEEDBACK_TYPES.FETCH_FEEDBACK_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        feedbacks: [],
      };

    // Submit Feedback
    case FEEDBACK_TYPES.SUBMIT_FEEDBACK_BEGIN:
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      };

    case FEEDBACK_TYPES.SUBMIT_FEEDBACK_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        feedbacks: [action.payload, ...state.feedbacks],
        statistics: {
          ...state.statistics,
          totalCount: state.statistics.totalCount + 1,
        },
        submitError: null,
      };

    case FEEDBACK_TYPES.SUBMIT_FEEDBACK_ERROR:
      return {
        ...state,
        isSubmitting: false,
        submitError: action.payload,
      };

    // Update Feedback
    case FEEDBACK_TYPES.UPDATE_FEEDBACK_BEGIN:
      return {
        ...state,
        isUpdating: true,
        updateError: null,
      };

    case FEEDBACK_TYPES.UPDATE_FEEDBACK_SUCCESS:
      return {
        ...state,
        isUpdating: false,
        feedbacks: state.feedbacks.map(feedback =>
          feedback.id === action.payload.id ? action.payload : feedback,
        ),
        updateError: null,
      };

    case FEEDBACK_TYPES.UPDATE_FEEDBACK_ERROR:
      return {
        ...state,
        isUpdating: false,
        updateError: action.payload,
      };

    // Delete Feedback
    case FEEDBACK_TYPES.DELETE_FEEDBACK_BEGIN:
      return {
        ...state,
        isDeleting: true,
        deleteError: null,
      };

    case FEEDBACK_TYPES.DELETE_FEEDBACK_SUCCESS:
      return {
        ...state,
        isDeleting: false,
        feedbacks: state.feedbacks.filter(feedback => feedback.id !== action.payload),
        statistics: {
          ...state.statistics,
          totalCount: Math.max(0, state.statistics.totalCount - 1),
        },
        deleteError: null,
      };

    case FEEDBACK_TYPES.DELETE_FEEDBACK_ERROR:
      return {
        ...state,
        isDeleting: false,
        deleteError: action.payload,
      };

    // Mark Feedback Helpful
    case FEEDBACK_TYPES.MARK_FEEDBACK_HELPFUL_BEGIN:
      return {
        ...state,
        isMarkingHelpful: true,
        helpfulError: null,
      };

    case FEEDBACK_TYPES.MARK_FEEDBACK_HELPFUL_SUCCESS:
      return {
        ...state,
        isMarkingHelpful: false,
        feedbacks: state.feedbacks.map(feedback =>
          feedback.id === action.payload.feedbackId
            ? {
                ...feedback,
                helpfulCount: action.payload.helpfulCount,
                isHelpfulByCurrentUser: action.payload.isHelpful,
              }
            : feedback,
        ),
        helpfulError: null,
      };

    case FEEDBACK_TYPES.MARK_FEEDBACK_HELPFUL_ERROR:
      return {
        ...state,
        isMarkingHelpful: false,
        helpfulError: action.payload,
      };

    // Report Feedback
    case FEEDBACK_TYPES.REPORT_FEEDBACK_BEGIN:
      return {
        ...state,
        isReporting: true,
        reportError: null,
      };

    case FEEDBACK_TYPES.REPORT_FEEDBACK_SUCCESS:
      return {
        ...state,
        isReporting: false,
        feedbacks: state.feedbacks.map(feedback =>
          feedback.id === action.payload
            ? { ...feedback, isReportedByCurrentUser: true }
            : feedback,
        ),
        reportError: null,
      };

    case FEEDBACK_TYPES.REPORT_FEEDBACK_ERROR:
      return {
        ...state,
        isReporting: false,
        reportError: action.payload,
      };

    // Clear State
    case FEEDBACK_TYPES.CLEAR_FEEDBACK_STATE:
      return initialState;

    // Update Filters (for local state management)
    case 'UPDATE_FEEDBACK_FILTERS':
      return {
        ...state,
        currentFilters: {
          ...state.currentFilters,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};

export default activityFeedbackReducer;
