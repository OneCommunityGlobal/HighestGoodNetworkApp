import {
  ENHANCED_POPULARITY_DATA_REQUEST,
  ENHANCED_POPULARITY_DATA_SUCCESS,
  ENHANCED_POPULARITY_DATA_FAILURE,
  ENHANCED_POPULARITY_ROLES_REQUEST,
  ENHANCED_POPULARITY_ROLES_SUCCESS,
  ENHANCED_POPULARITY_ROLES_FAILURE,
} from '../../constants/EnchanedPopularityAnalytics/EnchanedPopularityConstants';

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const enhancedPopularityAnalyticsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ENHANCED_POPULARITY_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    case ENHANCED_POPULARITY_DATA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case ENHANCED_POPULARITY_DATA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const enchancedPopularityRolesReducer = (state = initialState, action) => {
  switch (action.type) {
    case ENHANCED_POPULARITY_ROLES_REQUEST:
      return { ...state, loading: true, error: null };
    case ENHANCED_POPULARITY_ROLES_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case ENHANCED_POPULARITY_ROLES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
