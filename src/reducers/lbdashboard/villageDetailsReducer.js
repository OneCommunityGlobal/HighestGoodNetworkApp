import {
  FETCH_ALL_VILLAGES_REQUEST,
  FETCH_ALL_VILLAGES_SUCCESS,
  FETCH_ALL_VILLAGES_FAILURE,
  FETCH_VILLAGE_DETAILS_REQUEST,
  FETCH_VILLAGE_DETAILS_SUCCESS,
  FETCH_VILLAGE_DETAILS_FAILURE,
} from '../../constants/lbdashboard/villageDetailsConstants';

const initialState = {
  villages: [],
  loading: false,
  error: null,
  villageDetails: {},
};

export default function villageDetailsReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ALL_VILLAGES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ALL_VILLAGES_SUCCESS:
      return {
        ...state,
        loading: false,
        villages: action.payload,
      };
    case FETCH_ALL_VILLAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case FETCH_VILLAGE_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_VILLAGE_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        villageDetails: {
          ...state.villageDetails,
          [action.payload._id]: action.payload,
        },
      };
    case FETCH_VILLAGE_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}
