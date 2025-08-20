import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

export const FETCH_BM_INJURY_DATA_REQUEST = 'FETCH_BM_INJURY_DATA_REQUEST';
export const FETCH_BM_INJURY_DATA_SUCCESS = 'FETCH_BM_INJURY_DATA_SUCCESS';
export const FETCH_BM_INJURY_DATA_FAILURE = 'FETCH_BM_INJURY_DATA_FAILURE';
export const RESET_BM_INJURY_DATA = 'RESET_BM_INJURY_DATA';
export const FETCH_BM_INJURY_SEVERITIES = 'FETCH_BM_INJURY_SEVERITIES';
export const FETCH_BM_INJURY_TYPES = 'FETCH_BM_INJURY_TYPES';
export const FETCH_BM_INJURY_PROJECTS = 'FETCH_BM_INJURY_PROJECTS';

// Helpers
const cleanParams = (obj = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      if (v.length) out[k] = v;
    } else if (v !== '' && v !== null && v !== undefined) {
      out[k] = v;
    }
  }
  return out;
};
const paramsSerializer = params => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    usp.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  return usp.toString();
};
const safeData = res => (Array.isArray(res?.data) ? res.data : res?.data?.data ?? []);

// Action creators
export const resetInjuryData = () => ({ type: RESET_BM_INJURY_DATA });
const setInjuryDataLoading = () => ({ type: FETCH_BM_INJURY_DATA_REQUEST });
const setInjuryDataSuccess = payload => ({ type: FETCH_BM_INJURY_DATA_SUCCESS, payload });
const setInjuryDataError = payload => ({ type: FETCH_BM_INJURY_DATA_FAILURE, payload });
const setInjurySeverities = payload => ({ type: FETCH_BM_INJURY_SEVERITIES, payload });
const setInjuryTypes = payload => ({ type: FETCH_BM_INJURY_TYPES, payload });
const setInjuryProjects = payload => ({ type: FETCH_BM_INJURY_PROJECTS, payload });

// Thunks
export const fetchInjuryData = (filters) => async dispatch => {
  dispatch(setInjuryDataLoading());
  try {
    const params = cleanParams(filters);
    const res = await axios.get(ENDPOINTS.BM_INJURY_CATEGORY_BREAKDOWN, { params, paramsSerializer });
    dispatch(setInjuryDataSuccess(safeData(res)));
  } catch (error) {
    const msg = error?.response?.data?.error || error?.message || 'Failed to fetch injury data';
    dispatch(setInjuryDataError(msg));
  }
};

export const fetchSeverities = () => async dispatch => {
  try {
    const res = await axios.get(ENDPOINTS.BM_INJURY_SEVERITIES);
    dispatch(setInjurySeverities(Array.isArray(res.data) ? res.data : []));
  } catch {
    dispatch(setInjurySeverities([]));
  }
};

export const fetchInjuryTypes = () => async dispatch => {
  try {
    const res = await axios.get(ENDPOINTS.BM_INJURY_TYPES);
    dispatch(setInjuryTypes(Array.isArray(res.data) ? res.data : []));
  } catch {
    dispatch(setInjuryTypes([]));
  }
};

export const fetchInjuryProjects = (filters) => async dispatch => {
  try {
    const params = cleanParams(filters);
    const res = await axios.get(ENDPOINTS.BM_INJURY_PROJECTS, { params, paramsSerializer });
    dispatch(setInjuryProjects(Array.isArray(res.data) ? res.data : []));
  } catch {
    dispatch(setInjuryProjects([]));
  }
};

