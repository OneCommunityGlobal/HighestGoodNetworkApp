import { timeEntriesForSpecifiedPeriodReducer } from '../timeEntriesForSpecifiedPeriodReducer';

describe('timeEntriesForSpecifiedPeriodReducer', () => {
  it('should return the initial state when no state is provided', () => {
    const initialState = null;
    const action = { type: 'UNKNOWN_ACTION' };
    const result = timeEntriesForSpecifiedPeriodReducer(undefined, action);
    expect(result).toBe(initialState);
  });

  it('should return the current state for an unknown action type', () => {
    const currentState = [{ id: 1, hours: 5 }];
    const action = { type: 'UNKNOWN_ACTION' };
    const result = timeEntriesForSpecifiedPeriodReducer(currentState, action);
    expect(result).toEqual(currentState);
  });

  it('should handle GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD and update the state', () => {
    const action = {
      type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD',
      payload: [
        { id: 2, hours: 8 },
        { id: 3, hours: 6 },
      ],
    };
    const result = timeEntriesForSpecifiedPeriodReducer(null, action);
    expect(result).toEqual(action.payload);
  });
});
