import axios from 'axios';
import {
  FETCH_LESSON_PLANS_REQUEST,
  FETCH_LESSON_PLANS_SUCCESS,
  FETCH_LESSON_PLANS_FAILURE,
  SAVE_LESSON_PLAN_REQUEST,
  SAVE_LESSON_PLAN_SUCCESS,
  SAVE_LESSON_PLAN_FAILURE,
  FETCH_SAVED_LESSON_PLANS_REQUEST,
  FETCH_SAVED_LESSON_PLANS_SUCCESS,
  FETCH_SAVED_LESSON_PLANS_FAILURE,
} from '~/constants/educationPortal/browselessonPlanConstant';
import { ENDPOINTS } from '~/utils/URL';

export const fetchLessonPlans = () => async dispatch => {
  dispatch({ type: FETCH_LESSON_PLANS_REQUEST });
  try {
    const res = await axios.get(ENDPOINTS.LESSON_PLANS, {
      headers: { Accept: 'application/json' },
    });
    dispatch({ type: FETCH_LESSON_PLANS_SUCCESS, payload: res.data.data });
  } catch (error) {
    dispatch({ type: FETCH_LESSON_PLANS_FAILURE, error: error.message });
  }
};

export const saveLessonPlan = (studentId, lessonPlanId) => async dispatch => {
  dispatch({ type: SAVE_LESSON_PLAN_REQUEST });
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      ENDPOINTS.SAVE_INTEREST,
      { studentId, lessonPlanId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    dispatch({ type: SAVE_LESSON_PLAN_SUCCESS, payload: res.data.data });
  } catch (error) {
    dispatch({ type: SAVE_LESSON_PLAN_FAILURE, error: error.message });
  }
};

export const fetchSavedLessonPlans = studentId => async dispatch => {
  dispatch({ type: FETCH_SAVED_LESSON_PLANS_REQUEST });
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `${ENDPOINTS.GET_SAVED}?studentId=${encodeURIComponent(studentId)}`,
      {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    dispatch({ type: FETCH_SAVED_LESSON_PLANS_SUCCESS, payload: res.data.data });
  } catch (error) {
    dispatch({ type: FETCH_SAVED_LESSON_PLANS_FAILURE, error: error.message });
  }
};