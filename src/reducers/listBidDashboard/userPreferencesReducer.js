import {
  FETCH_USER_PREFERENCES_REQUEST,
  FETCH_USER_PREFERENCES_SUCCESS,
  FETCH_USER_PREFERENCES_FAILURE,
  UPDATE_USER_PREFERENCES_REQUEST,
  UPDATE_USER_PREFERENCES_SUCCESS,
  UPDATE_USER_PREFERENCES_FAILURE,
} from '../../constants/lbdashboard/userPreferenceConstants';

const initialState = {
  loading: false,
  preferences: null,
  error: null,
};

export const userPreferencesReducer = (state, action = initialState) => {
  switch (action.type) {
    case FETCH_USER_PREFERENCES_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_USER_PREFERENCES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_USER_PREFERENCES_SUCCESS:
      return { ...state, loading: false, preferences: action.payload };
    case UPDATE_USER_PREFERENCES_SUCCESS:
      return { ...state, loading: false, preferences: action.payload };
    case FETCH_USER_PREFERENCES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_USER_PREFERENCES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state || initialState;
  }
};

export default userPreferencesReducer;
