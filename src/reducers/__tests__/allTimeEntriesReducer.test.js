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
});
