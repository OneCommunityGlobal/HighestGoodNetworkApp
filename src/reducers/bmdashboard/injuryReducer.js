import {
  FETCH_INJURIES_REQUEST,
  FETCH_INJURIES_SUCCESS,
  FETCH_INJURIES_FAILURE,
} from '../../actions/bmdashboard/types';

const initialState = {
  loading: false,
  data: {
    months: [],
    serious: [],
    medium: [],
    low: [],
  },
  error: null,
};

export default function injuryReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_INJURIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_INJURIES_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };

    case FETCH_INJURIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
