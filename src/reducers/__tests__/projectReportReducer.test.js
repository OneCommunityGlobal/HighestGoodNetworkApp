import { projectReportReducer } from '../projectReportReducer';
import {
  GET_PROJECT_REPORT_BEGIN,
  GET_PROJECT_REPORT_END,
} from '../../components/Reports/ProjectReport/actions';

describe('projectReportReducer', () => {
  it('should return the initial state', () => {
    const initialState = {
      project: null, // Updated to match reducer
      isLoading: false,
    };

    expect(projectReportReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle GET_PROJECT_REPORT_BEGIN by setting isLoading to true', () => {
    const action = { type: GET_PROJECT_REPORT_BEGIN };
    const initialState = {
      project: null, // Updated to match reducer
      isLoading: false,
    };

    const expectedState = {
      project: null, // Updated to match reducer
      isLoading: true,
    };

    expect(projectReportReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle GET_PROJECT_REPORT_END by setting isLoading to false', () => {
    const action = { type: GET_PROJECT_REPORT_END };
    const initialState = {
      project: null, // Updated to match reducer
      isLoading: true,
    };

    const expectedState = {
      project: null, // Updated to match reducer
      isLoading: false,
    };

    expect(projectReportReducer(initialState, action)).toEqual(expectedState);
  });
});
