import {
  FETCH_BM_INJURY_DATA_REQUEST,
  FETCH_BM_INJURY_DATA_SUCCESS,
  FETCH_BM_INJURY_DATA_FAILURE,
  FETCH_BM_INJURY_SEVERITIES,
  FETCH_BM_INJURY_TYPES,
} from '../../actions/bmdashboard/injuryActions';

const initialState = {
  loading: false,
  data: [],
  error: null,
  severities: [],
  injuryTypes: [],
};
// eslint-disable-next-line default-param-last
function bmInjuryReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_BM_INJURY_DATA_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BM_INJURY_DATA_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_BM_INJURY_DATA_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_BM_INJURY_SEVERITIES:
      return { ...state, severities: action.payload };
    case FETCH_BM_INJURY_TYPES:
      return { ...state, injuryTypes: action.payload };
    default:
      return state;
  }
}

export default bmInjuryReducer;
