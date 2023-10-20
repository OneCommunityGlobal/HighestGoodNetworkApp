import { combineReducers } from 'redux';
import { projectByIdReducer } from './projectByIdReducer';
import {
  GET_PROJECT_REPORT_BEGIN,
  GET_PROJECT_REPORT_END,
} from '../components/Reports/ProjectReport/actions';

// eslint-disable-next-line import/prefer-default-export
export const projectReportReducer = combineReducers({
  project: projectByIdReducer,
  // eslint-disable-next-line default-param-last
  isLoading: (state = false, action) => {
    switch (action.type) {
      case GET_PROJECT_REPORT_BEGIN:
        return true;
      case GET_PROJECT_REPORT_END:
        return false;
      default:
        return state;
    }
  },
});
