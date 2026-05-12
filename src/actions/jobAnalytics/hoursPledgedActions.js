import { HOURS_PLEDGED_REQUEST, HOURS_PLEDGED_SUCCESS, HOURS_PLEDGED_FAILURE } from '../../constants/jobAnalytics/hoursPledgedConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchHoursPledged = (queryParams, token) => async (dispatch) => {
  dispatch({ type: HOURS_PLEDGED_REQUEST });

  try {
    const response = await fetch(`${ENDPOINTS.HOURS_PLEDGED}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch hours pledged data');
    }

    dispatch({ type: HOURS_PLEDGED_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: HOURS_PLEDGED_FAILURE, payload: error.message });
  }
};