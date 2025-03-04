import { errorsReducer } from '../errorsReducer';
import { GET_ERRORS, CLEAR_ERRORS } from '../../constants/errors';

describe('errorsReducer', () => {
  const initialState = {};

  it('should return the initial state when no action is passed', () => {
    expect(errorsReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle GET_ERRORS', () => {
    const errorPayload = { msg: 'An error occurred', status: 500 };
    const action = {
      type: GET_ERRORS,
      payload: errorPayload,
    };
    const expectedState = errorPayload;
    expect(errorsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_ERRORS', () => {
    const currentState = { msg: 'Some error message', status: 400 };
    const action = { type: CLEAR_ERRORS };
    const expectedState = {};
    expect(errorsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should return current state for unknown action types', () => {
    const currentState = { msg: 'Some error message', status: 400 };
    const action = { type: 'UNKNOWN_ACTION_TYPE' };
    const expectedState = currentState;
    expect(errorsReducer(currentState, action)).toEqual(expectedState);
  });
});