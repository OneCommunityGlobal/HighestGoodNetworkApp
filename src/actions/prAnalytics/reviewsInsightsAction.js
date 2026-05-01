import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import {
  FETCH_REVIEWS_INSIGHTS_REQUEST,
  FETCH_REVIEWS_INSIGHTS_SUCCESS,
  FETCH_REVIEWS_INSIGHTS_FAILURE,
} from '../../constants/prAnalytics/reviewsInsightConstants';

export const fetchReviewsInsights = (queryParams, token) => async (dispatch) => {
  dispatch({ type: FETCH_REVIEWS_INSIGHTS_REQUEST });

  try {
    const response = await axios.get(`${ENDPOINTS.PR_REVIEWS_INSIGHTS}`, {
      params: queryParams,
      headers: {
        Authorization: `${token}`,
      },
    });

    dispatch({
      type: FETCH_REVIEWS_INSIGHTS_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_REVIEWS_INSIGHTS_FAILURE,
      payload: error.response?.data?.message || 'Failed to fetch reviews insights',
    });
  }
};