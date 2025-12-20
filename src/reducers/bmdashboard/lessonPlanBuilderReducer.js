import {
  FETCH_LESSON_PLAN_TEMPLATES_REQUEST,
  FETCH_LESSON_PLAN_TEMPLATES_SUCCESS,
  FETCH_LESSON_PLAN_TEMPLATES_FAIL,
  SAVE_LESSON_PLAN_DRAFT_REQUEST,
  SAVE_LESSON_PLAN_DRAFT_SUCCESS,
  SAVE_LESSON_PLAN_DRAFT_FAIL,
  SUBMIT_LESSON_PLAN_DRAFT,
  VIEW_LESSON_PLAN_DRAFT,
  SAVE_LESSON_PLAN_COMMENTS,
} from '../../constants/bmdashboard/lessonPlanBuilderConstants';

const initialState = {
  lessonPlanTemplates: [],
  submittedDrafts: [],
  viewedDrafts: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
const lessonPlanBuilderReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LESSON_PLAN_TEMPLATES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_LESSON_PLAN_TEMPLATES_SUCCESS:
      return {
        ...state,
        loading: false,
        lessonPlanTemplates: action.payload,
      };
    case FETCH_LESSON_PLAN_TEMPLATES_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SAVE_LESSON_PLAN_DRAFT_SUCCESS:
      return {
        ...state,
        submittedDrafts: [...state.submittedDrafts, action.payload],
        loading: false,
      };
    case SAVE_LESSON_PLAN_DRAFT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SAVE_LESSON_PLAN_DRAFT_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case VIEW_LESSON_PLAN_DRAFT:
      return {
        ...state,
        viewedDrafts: [...state.viewedDrafts, action.payload],
      };
    case SUBMIT_LESSON_PLAN_DRAFT:
      return {
        ...state,
        submittedDrafts: [...state.submittedDrafts, action.payload],
      };
    case SAVE_LESSON_PLAN_COMMENTS:
      return {
        ...state,
        submittedDrafts: state.submittedDrafts.map(draft =>
          draft.id === action.payload.id ? { ...draft, comments: action.payload.comments } : draft,
        ),
      };
    default:
      return state;
  }
};

export default lessonPlanBuilderReducer;
