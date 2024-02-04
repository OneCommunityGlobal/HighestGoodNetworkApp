import { combineReducers } from 'redux';
import { projectByIdReducer } from "./projectByIdReducer";
import { GET_PROJECT_REPORT_BEGIN, GET_PROJECT_REPORT_END } from "../components/Reports/ProjectReport/actions";

export const projectReportReducer = combineReducers({
  project: projectByIdReducer,
  isLoading: (state = false, action) => {
    switch (action.type) {
      case GET_PROJECT_REPORT_BEGIN:
        return true;
      case GET_PROJECT_REPORT_END:
        return false;
      default: 
        return state;
    }
  }
});
