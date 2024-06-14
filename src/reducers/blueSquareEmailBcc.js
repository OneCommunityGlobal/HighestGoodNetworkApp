import * as types from '../constants/BluequareEmailBccConstants';

const initialState = {
  emailAssignment: [],
  error: null,
};

export const BlueSquareEmailAssignment = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_BLUE_SQUARE_EMAIL_ASSIGNMENTS:
      return { ...state, emailAssignment: action.payload, error: null };
    case types.SET_BLUE_SQUARE_EMAIL_ASSIGNMENT:
      return {
        ...state,
        emailAssignment: [
          ...state.emailAssignment,
          action.payload 
        ],
        error: null,
      };
    case types.DELETE_BLUE_SQUARE_EMAIL_ASSIGNMENT:
      return {
        ...state,
        emailAssignment: state.emailAssignment.filter(ele => ele._id !== action.payload),
        error: null,
      };
      case types.BLUE_SQUARE_EMAIL_ASSIGNMENT_ERROR:
        return {
          ...state,
          error: action.payload,
        };
    default:
      return state;
  }
};