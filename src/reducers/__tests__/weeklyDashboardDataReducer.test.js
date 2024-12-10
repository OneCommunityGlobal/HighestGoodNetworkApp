import { weeklyDashboardDataReducer } from '../weeklyDashboardDataReducer';

describe('weeklyDashboardDataReducer', () => {
  it('should return the initial state when no action is provided', () => {
    const initialState = null;
    const action = {};
    const newState = weeklyDashboardDataReducer(undefined, action);
    expect(newState).toBe(initialState);
  });

  it('should handle GET_WEEKLY_DASHBOARD_DATA and update the state', () => {
    const initialState = null;
    const action = {
      type: 'GET_WEEKLY_DASHBOARD_DATA',
      payload: { dashboard: 'test data' },
    };
    const newState = weeklyDashboardDataReducer(initialState, action);
    expect(newState).toEqual({ dashboard: 'test data' });
  });

  it('should not update the state for unknown action types', () => {
    const initialState = { dashboard: 'existing data' };
    const action = { type: 'UNKNOWN_ACTION' };
    const newState = weeklyDashboardDataReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });
});
