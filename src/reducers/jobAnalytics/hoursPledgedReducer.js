import {
  HOURS_PLEDGED_REQUEST,
  HOURS_PLEDGED_SUCCESS,
  HOURS_PLEDGED_FAILURE,
} from '../../constants/jobAnalytics/hoursPledgedConstants';

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const hoursPledgedReducer = (state = initialState, action) => {
  switch (action.type) {
    case HOURS_PLEDGED_REQUEST:
      return { ...state, loading: true, error: null };
    case HOURS_PLEDGED_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case HOURS_PLEDGED_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
