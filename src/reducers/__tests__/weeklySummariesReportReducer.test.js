import {
  FETCH_SUMMARIES_REPORT_BEGIN,
  FETCH_SUMMARIES_REPORT_SUCCESS,
  FETCH_SUMMARIES_REPORT_ERROR,
  UPDATE_SUMMARY_REPORT,
} from '../../constants/weeklySummariesReport';
import { weeklySummariesReportReducer } from '../weeklySummariesReportReducer';

describe('weeklySummariesReportReducer', () => {
  const initialState = {
    summaries: [],
    loading: false,
    error: null,
  };

  it('should return the initial state when no valid action is provided', () => {
    expect(weeklySummariesReportReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_SUMMARIES_REPORT_BEGIN', () => {
    const action = { type: FETCH_SUMMARIES_REPORT_BEGIN };
    const expectedState = {
      ...initialState,
      loading: true,
      error: null,
    };
    expect(weeklySummariesReportReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_SUMMARIES_REPORT_SUCCESS', () => {
    const mockSummaries = [
      { _id: '1', data: 'summary1' },
      { _id: '2', data: 'summary2' },
    ];
    const action = {
      type: FETCH_SUMMARIES_REPORT_SUCCESS,
      payload: { weeklySummariesData: mockSummaries },
    };
    const expectedState = {
      ...initialState,
      loading: false,
      summaries: mockSummaries,
    };
    expect(weeklySummariesReportReducer(initialState, action)).toEqual(expectedState);
  });
});
