import * as types from '../constants/WeeklySummaryEmailBccConstants';

const initialState = {
  emailAssignment: [],
  error: null,
};

const WeeklySummaryEmailAssignment = (state = initialState, action = {}) => {
  switch (action.type) {
    case types.GET_WEEKLY_SUMMARY_EMAIL_ASSIGNMENTS:
      return {
        ...state,
        emailAssignment: action.payload,
        error: null,
      };
    case types.SET_WEEKLY_SUMMARY_EMAIL_ASSIGNMENT:
      return {
        ...state,
        emailAssignment: [...state.emailAssignment, action.payload],
        error: null,
      };
    case types.DELETE_WEEKLY_SUMMARY_EMAIL_ASSIGNMENT:
      return {
        ...state,
        emailAssignment: state.emailAssignment.filter(ele => ele._id !== action.payload),
        error: null,
      };
    case types.WEEKLY_SUMMARY_EMAIL_ASSIGNMENT_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default WeeklySummaryEmailAssignment;
