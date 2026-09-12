import { weeklySummariesReducer } from '../weeklySummariesReducer';
import * as actions from '../../constants/weeklySummaries';

describe('weeklySummariesReducer', () => {
  const initialState = {
    summaries: {},
    loading: false,
    fetchError: null,
  };

  it('should return the initial state when no action is provided', () => {
    expect(weeklySummariesReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_WEEKLY_SUMMARIES_BEGIN', () => {
    const action = { type: actions.FETCH_WEEKLY_SUMMARIES_BEGIN };
    const expectedState = {
      ...initialState,
      loading: true,
      fetchError: null,
    };
    expect(weeklySummariesReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_WEEKLY_SUMMARIES_SUCCESS', () => {
    const mockData = {
      weeklySummariesData: {
        week1: { summary: 'Test Summary 1' },
        week2: { summary: 'Test Summary 2' },
      },
    };
    const action = {
      type: actions.FETCH_WEEKLY_SUMMARIES_SUCCESS,
      payload: mockData,
    };
    const expectedState = {
      ...initialState,
      loading: false,
      summaries: mockData.weeklySummariesData,
    };
    expect(weeklySummariesReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_WEEKLY_SUMMARIES_ERROR', () => {
    const mockError = new Error('Failed to fetch data');
    const action = {
      type: actions.FETCH_WEEKLY_SUMMARIES_ERROR,
      payload: { error: mockError },
    };
    const expectedState = {
      ...initialState,
      loading: false,
      fetchError: mockError,
    };
    expect(weeklySummariesReducer(initialState, action)).toEqual(expectedState);
  });
});
