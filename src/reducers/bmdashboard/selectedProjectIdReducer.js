import { SET_SELECTED_PROJECT_ID } from "../../constants/bmdashboard/projectConstants";

export const selectedProjectIdReducer = (state = '', action) => {
  switch (action.type) {
    case 'SET_SELECTED_PROJECT_ID':
      return action.payload;
    default:
      return state;
  }
};


