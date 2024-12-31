import { timeEntriesForSpecifiedPeriodReducer } from '../timeEntriesForSpecifiedPeriodReducer';

describe('timeEntriesForSpecifiedPeriodReducer', () => {
  it('should return the initial state when state is undefined', () => {
    const initialState = null;
    const action = {};
    expect(timeEntriesForSpecifiedPeriodReducer(undefined, action)).toBe(initialState);
  });

  it('should return the current state when action type does not match', () => {
    const currentState = [{ id: 1, duration: '2h' }];
    const action = { type: 'UNKNOWN_ACTION', payload: [{ id: 2, duration: '3h' }] };
    expect(timeEntriesForSpecifiedPeriodReducer(currentState, action)).toBe(currentState);
  });

  it('should return the new state when action type is GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD', () => {
    const action = {
      type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD',
      payload: [{ id: 2, duration: '3h' }]
    };
    expect(timeEntriesForSpecifiedPeriodReducer(null, action)).toEqual(action.payload);
  });

  it('should update the state with the new time entries when action type is GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD', () => {
    const currentState = [{ id: 1, duration: '2h' }];
    const action = {
      type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD',
      payload: [{ id: 2, duration: '3h' }]
    };
    expect(timeEntriesForSpecifiedPeriodReducer(currentState, action)).toEqual(action.payload);
  });
});
