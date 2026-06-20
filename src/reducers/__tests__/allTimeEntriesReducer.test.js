// eslint-disable-next-line import/no-named-as-default
import allTimeEntriesReducer from '../allTimeEntriesReducer'; // Adjust the path as necessary

describe('allTimeEntriesReducer', () => {
  // Test 1: Should return the initial state when no action is passed
  it('should return the initial state when no action is passed', () => {
    const initialState = null;
    const action = {}; // No action provided

    const result = allTimeEntriesReducer(initialState, action);
    expect(result).toBeNull(); // Expect the state to be null, which is the initial state
  });

  // Test 2: Should handle GET_ALL_TIME_ENTRIES action and return the payload
  it('should handle GET_ALL_TIME_ENTRIES action and return payload', () => {
    const initialState = null; // Initial state is null
    const action = {
      type: 'GET_ALL_TIME_ENTRIES',
      payload: [{ id: 1, entry: 'Sample entry' }], // Action payload
    };

    const result = allTimeEntriesReducer(initialState, action);
    expect(result).toEqual(action.payload); // Expect the state to match the action's payload
  });

  // Test 3: Should return the previous state when an unknown action is passed
  it('should return the previous state when an unknown action is passed', () => {
    const initialState = [{ id: 1, entry: 'Sample entry' }]; // Initial state with some data
    const action = {
      type: 'UNKNOWN_ACTION', // An unknown action
      payload: [{ id: 2, entry: 'Another entry' }], // Payload won't matter for unknown actions
    };

    const result = allTimeEntriesReducer(initialState, action);
    expect(result).toEqual(initialState); // Expect the state to remain the same as the previous state
  });
});
