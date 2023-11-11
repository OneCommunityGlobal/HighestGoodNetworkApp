import { SET_USER_PROJECTS } from "constants/bmdashboard/materialsConstants"

const initialState = {
  projects: [],
  loading: false
};

export const bmProjectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_PROJECTS:
      return {
        projects: action.payload,
        loading: false
      };
    default:
      return state;
  }
};