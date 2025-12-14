import axios from 'axios';
import {
  FETCH_LESSON_PLANS_REQUEST,
  FETCH_LESSON_PLANS_SUCCESS,
  FETCH_LESSON_PLANS_FAILURE,
  FETCH_LESSON_PLAN_DETAIL_REQUEST,
  FETCH_LESSON_PLAN_DETAIL_SUCCESS,
  FETCH_LESSON_PLAN_DETAIL_FAILURE,
  SAVE_LESSON_PLAN_REQUEST,
  SAVE_LESSON_PLAN_SUCCESS,
  SAVE_LESSON_PLAN_FAILURE,
  REMOVE_LESSON_PLAN_REQUEST,
  REMOVE_LESSON_PLAN_SUCCESS,
  REMOVE_LESSON_PLAN_FAILURE,
  FETCH_SAVED_LESSON_PLANS_REQUEST,
  FETCH_SAVED_LESSON_PLANS_SUCCESS,
  FETCH_SAVED_LESSON_PLANS_FAILURE,
  CHECK_IF_SAVED_REQUEST,
  CHECK_IF_SAVED_SUCCESS,
  CHECK_IF_SAVED_FAILURE,
  SET_FILTERS,
  CLEAR_FILTERS,
  SET_SEARCH_QUERY,
  SET_VIEW_MODE,
} from '~/constants/educationPortal/browselessonPlanConstant';
import { ENDPOINTS } from '~/utils/URL';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchLessonPlans = (params = {}) => async dispatch => {
  dispatch({ type: FETCH_LESSON_PLANS_REQUEST });
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${ENDPOINTS.LESSON_PLANS}${queryString ? `?${queryString}` : ''}`;
    
    const res = await axios.get(url, { 
      headers: getAuthHeaders(),
      withCredentials: true // Include credentials if needed
    });
    
    dispatch({
      type: FETCH_LESSON_PLANS_SUCCESS,
      payload: res.data.data,
      meta: res.data.meta,
    });
  } catch (error) {
    console.error('Fetch lesson plans error:', error);
    const errorMessage = error.response?.status === 401 
      ? 'Please log in to view lesson plans'
      : error.response?.data?.error || error.message;
    
    dispatch({
      type: FETCH_LESSON_PLANS_FAILURE,
      error: errorMessage,
    });
  }
};

export const fetchLessonPlanDetail = id => async dispatch => {
  dispatch({ type: FETCH_LESSON_PLAN_DETAIL_REQUEST });
  try {
    const res = await axios.get(`${ENDPOINTS.LESSON_PLANS}/${id}`, {
      headers: getAuthHeaders(),
      withCredentials: true
    });
    dispatch({ type: FETCH_LESSON_PLAN_DETAIL_SUCCESS, payload: res.data.data });
  } catch (error) {
    console.error('Fetch lesson plan detail error:', error);
    const errorMessage = error.response?.status === 401 
      ? 'Please log in to view lesson plan details'
      : error.response?.data?.error || error.message;
    
    dispatch({
      type: FETCH_LESSON_PLAN_DETAIL_FAILURE,
      error: errorMessage,
    });
  }
};

export const saveLessonPlan = (studentId, lessonPlanId) => async dispatch => {
  dispatch({ type: SAVE_LESSON_PLAN_REQUEST });
  try {
    const res = await axios.post(
      ENDPOINTS.SAVE_INTEREST,
      { studentId, lessonPlanId },
      { 
        headers: getAuthHeaders(),
        withCredentials: true
      }
    );
    dispatch({
      type: SAVE_LESSON_PLAN_SUCCESS,
      payload: res.data.data,
      lessonPlanId,
    });
  } catch (error) {
    console.error('Save lesson plan error:', error);
    const errorMessage = error.response?.status === 401 
      ? 'Please log in to save lesson plans'
      : error.response?.data?.error || error.message;
    
    dispatch({
      type: SAVE_LESSON_PLAN_FAILURE,
      error: errorMessage,
    });
  }
};

export const removeLessonPlan = (studentId, lessonPlanId) => async dispatch => {
  dispatch({ type: REMOVE_LESSON_PLAN_REQUEST });
  try {
    const res = await axios.delete(
      `${ENDPOINTS.REMOVE_INTEREST}/${lessonPlanId}?studentId=${studentId}`,
      { 
        headers: getAuthHeaders(),
        withCredentials: true
      }
    );
    dispatch({
      type: REMOVE_LESSON_PLAN_SUCCESS,
      payload: res.data.data,
      lessonPlanId,
    });
  } catch (error) {
    console.error('Remove lesson plan error:', error);
    const errorMessage = error.response?.status === 401 
      ? 'Please log in to remove saved lesson plans'
      : error.response?.data?.error || error.message;
    
    dispatch({
      type: REMOVE_LESSON_PLAN_FAILURE,
      error: errorMessage,
    });
  }
};

export const fetchSavedLessonPlans = studentId => async dispatch => {
  dispatch({ type: FETCH_SAVED_LESSON_PLANS_REQUEST });
  try {
    const res = await axios.get(
      `${ENDPOINTS.GET_SAVED}?studentId=${encodeURIComponent(studentId)}`,
      { 
        headers: getAuthHeaders(),
        withCredentials: true
      }
    );
    dispatch({
      type: FETCH_SAVED_LESSON_PLANS_SUCCESS,
      payload: res.data.data,
      meta: res.data.meta,
    });
  } catch (error) {
    console.error('Fetch saved lesson plans error:', error);
    const errorMessage = error.response?.status === 401 
      ? 'Please log in to view saved lesson plans'
      : error.response?.data?.error || error.message;
    
    dispatch({
      type: FETCH_SAVED_LESSON_PLANS_FAILURE,
      error: errorMessage,
    });
  }
};

export const checkIfSaved = (studentId, lessonPlanId) => async dispatch => {
  dispatch({ type: CHECK_IF_SAVED_REQUEST });
  try {
    const res = await axios.get(
      `${ENDPOINTS.CHECK_IF_SAVED}?studentId=${studentId}&lessonPlanId=${lessonPlanId}`,
      { 
        headers: getAuthHeaders(),
        withCredentials: true
      }
    );
    dispatch({
      type: CHECK_IF_SAVED_SUCCESS,
      payload: res.data.isSaved,
      lessonPlanId,
    });
  } catch (error) {
    console.error('Check if saved error:', error);
    dispatch({
      type: CHECK_IF_SAVED_FAILURE,
      error: error.response?.data?.error || error.message,
    });
  }
};

export const setFilters = filters => ({
  type: SET_FILTERS,
  payload: filters,
});

export const clearFilters = () => ({
  type: CLEAR_FILTERS,
});

export const setSearchQuery = query => ({
  type: SET_SEARCH_QUERY,
  payload: query,
});

export const setViewMode = mode => ({
  type: SET_VIEW_MODE,
  payload: mode,
});