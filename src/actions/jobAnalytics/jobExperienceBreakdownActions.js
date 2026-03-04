import {
  EXPERIENCE_BREAKDOWN_REQUEST,
  EXPERIENCE_BREAKDOWN_SUCCESS,
  EXPERIENCE_BREAKDOWN_FAILURE,
} from '../../constants/jobAnalytics/jobExperienceBreakdownConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchExperienceBreakdown = (queryParams, token) => async (dispatch) => {
  dispatch({ type: EXPERIENCE_BREAKDOWN_REQUEST });
  
  try { 
    const response = await fetch(`${ENDPOINTS.JOB_ANALYTICS_EXPERIENCE_BREAKDOWN}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch experience breakdown data');
    }

    dispatch({ type: EXPERIENCE_BREAKDOWN_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: EXPERIENCE_BREAKDOWN_FAILURE, payload: error.message });
  } 
}
