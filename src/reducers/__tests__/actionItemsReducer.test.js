import { actionItemsReducer } from '../actionItemsReducer';

// Test initial state
test('should return the initial state when no action is provided', () => {
  expect(actionItemsReducer(undefined, {})).toBeNull();
});

// Test handling of GET_ACTION_ITEMS action
test('should handle GET_ACTION_ITEMS action', () => {
  const initialState = null;
  const action = {
    type: 'GET_ACTION_ITEMS',
    payload: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
  };
  const expectedState = action.payload;
  
  expect(actionItemsReducer(initialState, action)).toEqual(expectedState);
});

// Test with an unknown action type
test('should return current state for unknown action types', () => {
  const initialState = [{ id: 1, name: 'Item 1' }];
  const action = { type: 'UNKNOWN_ACTION' };
  
  expect(actionItemsReducer(initialState, action)).toEqual(initialState);
});