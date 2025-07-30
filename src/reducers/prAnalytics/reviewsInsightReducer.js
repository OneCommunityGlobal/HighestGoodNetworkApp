import {
  FETCH_REVIEWS_INSIGHTS_REQUEST,
  FETCH_REVIEWS_INSIGHTS_SUCCESS,
  FETCH_REVIEWS_INSIGHTS_FAILURE,
} from '../../constants/prAnalytics/reviewsInsightConstants';

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const reviewsInsightReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REVIEWS_INSIGHTS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_REVIEWS_INSIGHTS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_REVIEWS_INSIGHTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default reviewsInsightReducer;
