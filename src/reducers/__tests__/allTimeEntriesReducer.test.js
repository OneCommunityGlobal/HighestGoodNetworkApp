import { allTimeEntriesReducer } from '../allTimeEntriesReducer';

describe('allTimeEntriesReducer', () => {
  it('should return the initial state when no action is passed', () => {
    const initialState = null;
    const newState = allTimeEntriesReducer(undefined, {});
    expect(newState).toEqual(initialState);
  });

  it('should handle GET_ALL_TIME_ENTRIES action and return payload', () => {
    const initialState = null;
    const action = {
      type: 'GET_ALL_TIME_ENTRIES',
      payload: [{ id: 1, entry: 'Sample Time Entry' }],
    };

    const newState = allTimeEntriesReducer(initialState, action);
    expect(newState).toEqual(action.payload);
  });

  it('should return the previous state when an unknown action is passed', () => {
    const initialState = [{ id: 1, entry: 'Previous Entry' }];
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: [{ id: 2, entry: 'New Time Entry' }],
    };

    const newState = allTimeEntriesReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });

  it('should return null if state is explicitly provided as null and no action is passed', () => {
    const initialState = null;
    const newState = allTimeEntriesReducer(null, {});
    expect(newState).toBeNull();
  });
  it('should handle GET_ALL_TIME_ENTRIES with an empty payload', () => {
    const initialState = null;
    const action = {
      type: 'GET_ALL_TIME_ENTRIES',
      payload: [],
    };

    const newState = allTimeEntriesReducer(initialState, action);
    expect(newState).toEqual(action.payload);
  });
  it('should handle GET_ALL_TIME_ENTRIES action with malformed data in payload', () => {
    const initialState = null;
    const action = {
      type: 'GET_ALL_TIME_ENTRIES',
      payload: 'Invalid Payload', // Payload is not an array
    };

    const newState = allTimeEntriesReducer(initialState, action);
    expect(newState).toEqual(action.payload);
  });
  it('should return the state when the action type does not exist', () => {
    const initialState = [{ id: 1, entry: 'Sample Entry' }];
    const action = {
      type: 'NON_EXISTENT_ACTION',
      payload: [{ id: 2, entry: 'New Entry' }],
    };

    const newState = allTimeEntriesReducer(initialState, action);
    expect(newState).toEqual(initialState);
  });
  it('should handle GET_ALL_TIME_ENTRIES action with a non-object payload', () => {
    const initialState = null;
    const action = {
      type: 'GET_ALL_TIME_ENTRIES',
      payload: 123, // Non-object payload
    };

    const newState = allTimeEntriesReducer(initialState, action);
    expect(newState).toBe(123);
  });

  it('should handle multiple GET_ALL_TIME_ENTRIES actions correctly', () => {
    const initialState = null;
    const action1 = {
      type: 'GET_ALL_TIME_ENTRIES',
      payload: [{ id: 1, entry: 'Entry 1' }],
    };
    const action2 = {
      type: 'GET_ALL_TIME_ENTRIES',
      payload: [{ id: 2, entry: 'Entry 2' }],
    };

    let newState = allTimeEntriesReducer(initialState, action1);
    expect(newState).toEqual(action1.payload);

    newState = allTimeEntriesReducer(newState, action2);
    expect(newState).toEqual(action2.payload);
  });

});