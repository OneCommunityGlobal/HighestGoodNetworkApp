import * as actions from '../../constants/weeklySummariesReport';
import weeklySummaryRecipientsReducer from '../weeklySummaryRecipientsReducer';

describe('weeklySummaryRecipientsReducer', () => {
  const initialState = {
    user: {},
    recepientsArr: [],
    err: null,
  };

  it('should return the initial state', () => {
    expect(weeklySummaryRecipientsReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle DELETE_WEEKLY_SUMMARIES_RECIPIENTS', () => {
    const action = {
      type: actions.DELETE_WEEKLY_SUMMARIES_RECIPIENTS,
      payload: { userid: '123' },
    };
    const state = {
      ...initialState,
      recepientsArr: [{ _id: '123' }, { _id: '456' }],
    };
    const expectedState = {
      ...initialState,
      recepientsArr: [{ _id: '456' }],
    };

    expect(weeklySummaryRecipientsReducer(state, action)).toEqual(expectedState);
  });

  it('should handle AUTHORIZE_WEEKLY_SUMMARY_REPORTS', () => {
    const action = {
      type: actions.AUTHORIZE_WEEKLY_SUMMARY_REPORTS,
      payload: true,
    };
    const expectedState = {
      ...initialState,
      passwordMatch: true,
    };

    expect(weeklySummaryRecipientsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle AUTHORIZE_WEEKLYSUMMARIES_REPORTS_ERROR', () => {
    const action = {
      type: actions.AUTHORIZE_WEEKLYSUMMARIES_REPORTS_ERROR,
      payload: 'Password mismatch',
    };
    const expectedState = {
      ...initialState,
      passwordMatchErr: 'Password mismatch',
    };

    expect(weeklySummaryRecipientsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle GET_SUMMARY_RECIPIENTS', () => {
    const action = {
      type: actions.GET_SUMMARY_RECIPIENTS,
      recepientsArr: [{ _id: '123' }, { _id: '456' }],
    };
    const expectedState = {
      ...initialState,
      recepientsArr: [{ _id: '123' }, { _id: '456' }],
    };

    expect(weeklySummaryRecipientsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle GET_SUMMARY_RECIPIENTS_ERROR', () => {
    const action = {
      type: actions.GET_SUMMARY_RECIPIENTS_ERROR,
      payload: { err: 'Failed to fetch recipients' },
    };
    const expectedState = {
      ...initialState,
      getRecepientsErr: 'Failed to fetch recipients',
    };

    expect(weeklySummaryRecipientsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should return the current state for unknown actions', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const state = { ...initialState, recepientsArr: [{ _id: '123' }] };

    expect(weeklySummaryRecipientsReducer(state, action)).toEqual(state);
  });
});
