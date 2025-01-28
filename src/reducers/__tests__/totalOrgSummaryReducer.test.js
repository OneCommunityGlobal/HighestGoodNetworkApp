import { totalOrgSummaryReducer } from '../totalOrgSummaryReducer';
import * as actions from '../../constants/totalOrgSummary';

describe('totalOrgSummaryReducer', () => {
  const initialState = {
    volunteerstats: [],
    volunteerOverview: [],
    loading: false,
    error: null,
    fetchingError: null,
    volunteerRolesTeamStats: {},
    isTeamStatsLoading: false,
    isTeamStatsError: null
  };

  it('should return the initial state when no action is provided', () => {
    const newState = totalOrgSummaryReducer(undefined, {});
    expect(newState).toEqual(initialState);
  });

  it('should handle FETCH_TOTAL_ORG_SUMMARY_BEGIN', () => {
    const action = { type: actions.FETCH_TOTAL_ORG_SUMMARY_BEGIN };
    const newState = totalOrgSummaryReducer(initialState, action);
    expect(newState).toEqual({
      ...initialState,
      loading: true,
      error: null,
    });
  });

  it('should handle FETCH_TOTAL_ORG_SUMMARY_SUCCESS', () => {
    const action = {
      type: actions.FETCH_TOTAL_ORG_SUMMARY_SUCCESS,
      payload: { volunteerstats: [{ id: 1, name: 'John Doe' }] },
    };
    const newState = totalOrgSummaryReducer(initialState, action);
    expect(newState).toEqual({
      ...initialState,
      loading: false,
      volunteerstats: [{ id: 1, name: 'John Doe' }],
    });
  });

  it('should handle FETCH_TOTAL_ORG_SUMMARY_ERROR', () => {
    const action = {
      type: actions.FETCH_TOTAL_ORG_SUMMARY_ERROR,
      payload: { error: 'Unable to fetch data' },
    };
    const newState = totalOrgSummaryReducer(initialState, action);
    expect(newState).toEqual({
      ...initialState,
      loading: false,
      error: 'Unable to fetch data',
    });
  });

  it('should handle FETCH_TOTAL_ORG_SUMMARY_DATA_SUCCESS', () => {
    const action = {
      type: actions.FETCH_TOTAL_ORG_SUMMARY_DATA_SUCCESS,
      payload: { volunteerOverview: [{ id: 2, name: 'Jane Doe' }] },
    };
    const newState = totalOrgSummaryReducer(initialState, action);
    expect(newState).toEqual({
      ...initialState,
      loading: false,
      volunteerOverview: [{ id: 2, name: 'Jane Doe' }],
    });
  });

  it('should handle FETCH_TOTAL_ORG_SUMMARY_DATA_ERROR', () => {
    const action = {
      type: actions.FETCH_TOTAL_ORG_SUMMARY_DATA_ERROR,
      payload: { fetchingError: 'Unable to fetch overview data' },
    };
    const newState = totalOrgSummaryReducer(initialState, action);
    expect(newState).toEqual({
      ...initialState,
      loading: false,
      fetchingError: 'Unable to fetch overview data',
    });
  });
});
