// src/redux/reducers/studentReducer.js
import {
  STUDENT_PROFILE_REQUEST,
  STUDENT_PROFILE_SUCCESS,
  STUDENT_PROFILE_FAIL,
  STUDENT_SUBJECT_TASKS_REQUEST,
  STUDENT_SUBJECT_TASKS_SUCCESS,
  STUDENT_SUBJECT_TASKS_FAIL,
  CLEAR_STUDENT_DATA,
} from '../constants/studentProfileConstants';

const initialState = {
  loading: false,
  profile: null, // This will hold the 'studentDetails' object
  subjectProgress: [], // This will hold the 'subjects' array
  subjectTasks: {}, // This will store tasks, organized by subject ID
  error: null,
};

export const studentReducer = (state = initialState, action) => {
  switch (action.type) {
    case STUDENT_PROFILE_REQUEST:
    case STUDENT_SUBJECT_TASKS_REQUEST:
      return { ...state, loading: true };

    case STUDENT_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: action.payload.studentDetails, // <-- Store only studentDetails here
        subjectProgress: action.payload.subjects, // <-- Store the subjects array here
        error: null,
      };

    case STUDENT_SUBJECT_TASKS_SUCCESS:
      // Assuming payload is { subjectId: 'math101', tasks: [...] }
      // This is a guess; you'll need to confirm your task API response
      const { subjectId, tasks } = action.payload;
      return {
        ...state,
        loading: false,
        subjectTasks: {
          ...state.subjectTasks, // Keep old tasks
          [subjectId]: tasks, // Add new tasks under their subjectId
        },
      };

    case STUDENT_PROFILE_FAIL:
    case STUDENT_SUBJECT_TASKS_FAIL:
      return { ...state, loading: false, error: action.payload };

    case CLEAR_STUDENT_DATA:
      return initialState;

    default:
      return state;
  }
};

export default studentReducer;
