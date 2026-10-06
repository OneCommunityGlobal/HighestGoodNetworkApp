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
  CHECK_IF_SAVED_SUCCESS,
  SET_FILTERS,
  CLEAR_FILTERS,
  SET_SEARCH_QUERY,
  SET_VIEW_MODE,
} from '~/constants/educationPortal/browseLPConstant';

const initialState = {
  plans: [],
  loading: false,
  error: null,
  saved: [],
  savedLoading: false,
  savedError: null,
  saving: false,
  savingError: null,
  currentPlan: null,
  meta: null,
  savedMeta: null,
  filters: {
    subjects: [],
    difficulty: null,
    tags: [],
    search: '',
  },
  viewMode: 'grid', // 'grid' or 'list'
  savedStatusMap: {}, // { lessonPlanId: boolean }
};

export default function browseLessonPlanReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LESSON_PLANS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_LESSON_PLANS_SUCCESS:
      return {
        ...state,
        loading: false,
        plans: action.payload,
        meta: action.meta,
      };
    case FETCH_LESSON_PLANS_FAILURE:
      return { ...state, loading: false, error: action.error };

    case FETCH_LESSON_PLAN_DETAIL_REQUEST:
      return { ...state, loading: true, error: null, currentPlan: null };
    case FETCH_LESSON_PLAN_DETAIL_SUCCESS:
      return { ...state, loading: false, currentPlan: action.payload };
    case FETCH_LESSON_PLAN_DETAIL_FAILURE:
      return { ...state, loading: false, error: action.error };

    case SAVE_LESSON_PLAN_REQUEST:
      return { ...state, saving: true, savingError: null };
    case SAVE_LESSON_PLAN_SUCCESS:
      return {
        ...state,
        saving: false,
        saved: action.payload,
        savedStatusMap: {
          ...state.savedStatusMap,
          [action.lessonPlanId]: true,
        },
      };
    case SAVE_LESSON_PLAN_FAILURE:
      return { ...state, saving: false, savingError: action.error };

    case REMOVE_LESSON_PLAN_REQUEST:
      return { ...state, saving: true, savingError: null };
    case REMOVE_LESSON_PLAN_SUCCESS:
      return {
        ...state,
        saving: false,
        saved: action.payload,
        savedStatusMap: {
          ...state.savedStatusMap,
          [action.lessonPlanId]: false,
        },
      };
    case REMOVE_LESSON_PLAN_FAILURE:
      return { ...state, saving: false, savingError: action.error };

    case FETCH_SAVED_LESSON_PLANS_REQUEST:
      return { ...state, savedLoading: true, savedError: null };
    case FETCH_SAVED_LESSON_PLANS_SUCCESS:
      return {
        ...state,
        savedLoading: false,
        saved: action.payload,
        savedMeta: action.meta,
      };
    case FETCH_SAVED_LESSON_PLANS_FAILURE:
      return { ...state, savedLoading: false, savedError: action.error };

    case CHECK_IF_SAVED_SUCCESS:
      return {
        ...state,
        savedStatusMap: {
          ...state.savedStatusMap,
          [action.lessonPlanId]: action.payload,
        },
      };

    case SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case CLEAR_FILTERS:
      return {
        ...state,
        filters: initialState.filters,
      };
    case SET_SEARCH_QUERY:
      return {
        ...state,
        filters: { ...state.filters, search: action.payload },
      };
    case SET_VIEW_MODE:
      return { ...state, viewMode: action.payload };

    default:
      return state;
  }
}
