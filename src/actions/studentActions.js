import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  STUDENT_PROFILE_REQUEST,
  STUDENT_PROFILE_SUCCESS,
  STUDENT_PROFILE_FAIL,
  STUDENT_SUBJECT_TASKS_REQUEST,
  STUDENT_SUBJECT_TASKS_SUCCESS,
  STUDENT_SUBJECT_TASKS_FAIL,
} from '../constants/studentProfileConstants';

// --- THIS IS THE KEY PART ---
// This helper function gets the token from localStorage
// and builds the authorization header.
const getTokenConfig = () => {
  // 1. Get the token from where you stored it (usually localStorage)
  const token = localStorage.getItem('token'); // <-- Change 'token' if you named it something else

  // 2. Create the config object
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 3. If the token exists, add it to the headers
  if (token) {
    config.headers['Authorization'] = token;
  }

  return config;
};

// --- END KEY PART ---

// Fetch Student Profile
export const fetchStudentProfile = () => async dispatch => {
  try {
    dispatch({ type: STUDENT_PROFILE_REQUEST });

    // 1. Get the config with the token
    const config = getTokenConfig();

    // 2. Pass the config to your axios request
    const { data } = await axios.get(ENDPOINTS.STUDENT_PROFILE, config);

    dispatch({ type: STUDENT_PROFILE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: STUDENT_PROFILE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Fetch Subject Tasks
export const fetchSubjectTasks = subjectId => async dispatch => {
  try {
    dispatch({ type: STUDENT_SUBJECT_TASKS_REQUEST });

    // 1. Get the config with the token
    const config = getTokenConfig();

    // 2. Pass the config to your axios request
    const { data } = await axios.get(ENDPOINTS.STUDENT_SUBJECT_TASKS(subjectId), config);

    dispatch({ type: STUDENT_SUBJECT_TASKS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: STUDENT_SUBJECT_TASKS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
