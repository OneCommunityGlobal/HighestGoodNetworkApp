import {
  JOBS_APPS_HITS_REQUEST,
  JOBS_APPS_HITS_REQUEST_SUCCESS,
  JOBS_APPS_HITS_REQUEST_FAILURE,
} from '../../constants/jobAnalytics/JobsApplicationsHitsConstants';

export const initialState = {
  loading: false,
  data: [],
  error: '',
};

export const JobsHitsApplicationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case JOBS_APPS_HITS_REQUEST:
      return {
        loading: true,
        data: [],
        error: '',
      };
    case JOBS_APPS_HITS_REQUEST_SUCCESS:
      return {
        loading: false,
        data: action.payload,
        error: '',
      };
    case JOBS_APPS_HITS_REQUEST_FAILURE:
      return {
        loading: false,
        data: [],
        error: action.payload,
      };
    default:
      return state;
  }
};
