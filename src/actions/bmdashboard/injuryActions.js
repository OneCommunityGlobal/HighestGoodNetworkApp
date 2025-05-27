import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { GET_ERRORS } from '../../constants/errors';

// Define action types inline
export const FETCH_BM_INJURY_DATA_REQUEST = 'FETCH_BM_INJURY_DATA_REQUEST';
export const FETCH_BM_INJURY_DATA_SUCCESS = 'FETCH_BM_INJURY_DATA_SUCCESS';
export const FETCH_BM_INJURY_DATA_FAILURE = 'FETCH_BM_INJURY_DATA_FAILURE';
export const RESET_BM_INJURY_DATA = 'RESET_BM_INJURY_DATA';

// Action creators
export const setInjuryDataLoading = () => ({
  type: FETCH_BM_INJURY_DATA_REQUEST,
});

export const setInjuryDataSuccess = payload => ({
  type: FETCH_BM_INJURY_DATA_SUCCESS,
  payload,
});

export const setInjuryDataError = payload => ({
  type: FETCH_BM_INJURY_DATA_FAILURE,
  payload,
});

export const resetInjuryData = () => ({
  type: RESET_BM_INJURY_DATA,
});

// Thunk for fetching injury data
export const fetchInjuryData = filters => async dispatch => {
  dispatch(setInjuryDataLoading());

  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`${ENDPOINTS.BM_INJURY_CATEGORY_BREAKDOWN}?${query}`);
    dispatch(setInjuryDataSuccess(res.data));
  } catch (err) {
    dispatch(setInjuryDataError(err.message || 'Error fetching injury data.'));
    dispatch({ type: GET_ERRORS, payload: err });
  }
};
