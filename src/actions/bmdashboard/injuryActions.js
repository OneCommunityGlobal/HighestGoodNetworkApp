import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { GET_ERRORS } from '../../constants/errors';

export const FETCH_BM_INJURY_DATA_REQUEST = 'FETCH_BM_INJURY_DATA_REQUEST';
export const FETCH_BM_INJURY_DATA_SUCCESS = 'FETCH_BM_INJURY_DATA_SUCCESS';
export const FETCH_BM_INJURY_DATA_FAILURE = 'FETCH_BM_INJURY_DATA_FAILURE';
export const RESET_BM_INJURY_DATA = 'RESET_BM_INJURY_DATA';
export const FETCH_BM_INJURY_SEVERITIES = 'FETCH_BM_INJURY_SEVERITIES';
export const FETCH_BM_INJURY_TYPES = 'FETCH_BM_INJURY_TYPES';

// Action creators
export const setInjuryDataLoading = () => ({ type: FETCH_BM_INJURY_DATA_REQUEST });
export const setInjuryDataSuccess = payload => ({ type: FETCH_BM_INJURY_DATA_SUCCESS, payload });
export const setInjuryDataError = payload => ({ type: FETCH_BM_INJURY_DATA_FAILURE, payload });
export const resetInjuryData = () => ({ type: RESET_BM_INJURY_DATA });
export const setInjurySeverities = payload => ({ type: FETCH_BM_INJURY_SEVERITIES, payload });
export const setInjuryTypes = payload => ({ type: FETCH_BM_INJURY_TYPES, payload });

// Thunk to fetch injury data
export const fetchInjuryData = filters => async dispatch => {
  dispatch(setInjuryDataLoading());
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`${ENDPOINTS.BM_INJURY_CATEGORY_BREAKDOWN}?${query}`);
    dispatch(setInjuryDataSuccess(res.data));
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message;
    dispatch(setInjuryDataError(errorMessage));
  }
};

// Thunk to fetch severities
export const fetchSeverities = () => async dispatch => {
  try {
    const res = await axios.get(ENDPOINTS.BM_INJURY_SEVERITIES);
    dispatch(setInjurySeverities(res.data));
  } catch (error) {
    console.error('[fetchSeverities] error:', error);
  }
};

// Thunk to fetch injury types
export const fetchInjuryTypes = () => async dispatch => {
  try {
    const res = await axios.get(ENDPOINTS.BM_INJURY_TYPES);
    dispatch(setInjuryTypes(res.data));
  } catch (error) {
    console.error('[fetchInjuryTypes] error:', error);
  }
};
