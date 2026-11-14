import {
  EXPERIENCE_BREAKDOWN_REQUEST,
  EXPERIENCE_BREAKDOWN_SUCCESS,
  EXPERIENCE_BREAKDOWN_FAILURE,
} from '../../constants/jobAnalytics/jobExperienceBreakdownConstants';

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const jobExperienceBreakdownReducer = (state = initialState, action) => {
  switch (action.type) {
    case EXPERIENCE_BREAKDOWN_REQUEST:
      return { ...state, loading: true, error: null };
    case EXPERIENCE_BREAKDOWN_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case EXPERIENCE_BREAKDOWN_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
