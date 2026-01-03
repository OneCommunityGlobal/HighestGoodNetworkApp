import * as actions from '../constants/weeklySummariesReport';

const initialState = {
  savedFilters: [],
  loading: false,
  error: null,
  createLoading: false,
  deleteLoading: false,
  updateLoading: false,
};

// eslint-disable-next-line default-param-last
export const savedFilterReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_SAVED_FILTERS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_SAVED_FILTERS_SUCCESS:
      return {
        ...state,
        loading: false,
        savedFilters: action.payload.savedFiltersData,
      };

    case actions.FETCH_SAVED_FILTERS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    case actions.CREATE_SAVED_FILTER_BEGIN:
      return {
        ...state,
        createLoading: true,
        error: null,
      };

    case actions.CREATE_SAVED_FILTER_SUCCESS:
      return {
        ...state,
        createLoading: false,
        savedFilters: [...state.savedFilters, action.payload.savedFilterData],
      };

    case actions.CREATE_SAVED_FILTER_ERROR:
      return {
        ...state,
        createLoading: false,
        error: action.payload.error,
      };

    case actions.DELETE_SAVED_FILTER_BEGIN:
      return {
        ...state,
        deleteLoading: true,
        error: null,
      };

    case actions.DELETE_SAVED_FILTER_SUCCESS:
      return {
        ...state,
        deleteLoading: false,
        savedFilters: state.savedFilters.filter(filter => filter._id !== action.payload.filterId),
      };

    case actions.DELETE_SAVED_FILTER_ERROR:
      return {
        ...state,
        deleteLoading: false,
        error: action.payload.error,
      };

    case actions.UPDATE_SAVED_FILTER_BEGIN:
      return {
        ...state,
        updateLoading: true,
        error: null,
      };

    case actions.UPDATE_SAVED_FILTER_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        savedFilters: state.savedFilters.map(filter =>
          filter._id === action.payload.savedFilterData._id
            ? action.payload.savedFilterData
            : filter,
        ),
      };

    case actions.UPDATE_SAVED_FILTER_ERROR:
      return {
        ...state,
        updateLoading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};

export default savedFilterReducer;
