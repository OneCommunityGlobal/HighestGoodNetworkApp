import { JOBS_APPS_HITS_REQUEST, JOBS_APPS_HITS_REQUEST_SUCCESS, JOBS_APPS_HITS_REQUEST_FAILURE } from '../../constants/jobAnalytics/JobsApplicationsHitsConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchJobsHitsApplications = (queryParams, token) => async (dispatch) => {
  dispatch({ type: JOBS_APPS_HITS_REQUEST });

  try {
    const response = await fetch(`${ENDPOINTS.JOB_HITS_AND_APPLICATIONS}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });

    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.error || 'Failed to fetch data');
    }

    dispatch({ type: JOBS_APPS_HITS_REQUEST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: JOBS_APPS_HITS_REQUEST_FAILURE, payload: error.message });
  }
}
