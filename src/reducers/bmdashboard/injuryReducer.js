import {
  FETCH_BM_INJURY_DATA_REQUEST,
  FETCH_BM_INJURY_DATA_SUCCESS,
  FETCH_BM_INJURY_DATA_FAILURE,
} from '../../actions/bmdashboard/injuryActions';

const initialState = {
  loading: false,
  data: [],
  error: null,
};

export const bmInjuryReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BM_INJURY_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BM_INJURY_DATA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_BM_INJURY_DATA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
