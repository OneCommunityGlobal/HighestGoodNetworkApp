import reducer from '../timeEntriesForSpecifiedPeriodReducer';

describe('timeEntriesForSpecifiedPeriodReducer', () => {
  const samplePayload = [{ id: 1, time: '2023-01-01' }, { id: 2, time: '2023-01-02' }];
  const initialState = null;

  it('should return the initial state when state is undefined', () => {
    const newState = reducer(undefined, {});
    expect(newState).toEqual(initialState);
  });

  it('should return the current state when action type does not match', () => {
    const currentState = [{ id: 99, time: '2023-04-30' }];
    const newState = reducer(currentState, { type: 'UNKNOWN_ACTION' });
    expect(newState).toEqual(currentState);
  });

  it('should return the new state when action type is GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD', () => {
    const newState = reducer(initialState, {
      type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD',
      payload: samplePayload,
    });
    expect(newState).toEqual(samplePayload);
  });

  it('should update the state with the new time entries when action type is GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD', () => {
    const currentState = [{ id: 0, time: '2023-01-01' }];
    const newState = reducer(currentState, {
      type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD',
      payload: samplePayload,
    });
    expect(newState).toEqual(samplePayload);
  });

  it('should return the initial state when no state is provided', () => {
    const newState = reducer(undefined, {});
    expect(newState).toEqual(initialState);
  });

  it('should return the current state for an unknown action type', () => {
    const currentState = [{ id: 3, time: '2023-04-29' }];
    const newState = reducer(currentState, { type: 'SOME_UNKNOWN_TYPE' });
    expect(newState).toEqual(currentState);
  });

  it('should handle GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD and update the state', () => {
    const action = {
      type: 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD',
      payload: samplePayload,
    };
    const newState = reducer(null, action);
    expect(newState).toEqual(samplePayload);
  });
});
