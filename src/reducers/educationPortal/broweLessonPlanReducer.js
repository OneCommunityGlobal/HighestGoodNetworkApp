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

const initialState = {
  plans: [],
  loading: false,
  error: null,
  saved: [],
  saving: false,
  savedError: null,
};

export default function browseLessonPlanReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LESSON_PLANS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_LESSON_PLANS_SUCCESS:
      return { ...state, loading: false, plans: action.payload };
    case FETCH_LESSON_PLANS_FAILURE:
      return { ...state, loading: false, error: action.error };

    case SAVE_LESSON_PLAN_REQUEST:
      return { ...state, saving: true, savedError: null };
    case SAVE_LESSON_PLAN_SUCCESS:
      return { ...state, saving: false, saved: action.payload };
    case SAVE_LESSON_PLAN_FAILURE:
      return { ...state, saving: false, savedError: action.error };

    case FETCH_SAVED_LESSON_PLANS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_SAVED_LESSON_PLANS_SUCCESS:
      return { ...state, loading: false, saved: action.payload };
    case FETCH_SAVED_LESSON_PLANS_FAILURE:
      return { ...state, loading: false, error: action.error };

    default:
      return state;
  }
}
