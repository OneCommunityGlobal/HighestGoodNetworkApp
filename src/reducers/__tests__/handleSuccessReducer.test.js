import { handleSuccessReducer } from '../handleSuccessReducer';

describe('handleSuccessReducer', () => {
  it('should return initial state when no state is provided', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const result = handleSuccessReducer(undefined, action);
    expect(result).toBe(null);
  });

  it('should handle REQUEST_SUCCEEDED action', () => {
    const initialState = null;
    const successPayload = { data: 'success data' };
    const action = {
      type: 'REQUEST_SUCCEEDED',
      payload: successPayload,
    };

    const result = handleSuccessReducer(initialState, action);
    expect(result).toEqual(successPayload);
  });

  it('should handle REQUEST_FAILED action', () => {
    const initialState = null;
    const errorResponse = { status: 404, message: 'Not Found' };
    const action = {
      type: 'REQUEST_FAILED',
      error: {
        response: errorResponse,
      },
    };

    const result = handleSuccessReducer(initialState, action);
    expect(result).toEqual(errorResponse);
  });

  it('should return current state for unknown action type', () => {
    const currentState = { existingData: 'some data' };
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: 'some payload',
    };

    const result = handleSuccessReducer(currentState, action);
    expect(result).toEqual(currentState);
  });

  it('should override existing state when handling REQUEST_SUCCEEDED', () => {
    const existingState = { oldData: 'old data' };
    const newPayload = { newData: 'new data' };
    const action = {
      type: 'REQUEST_SUCCEEDED',
      payload: newPayload,
    };

    const result = handleSuccessReducer(existingState, action);
    expect(result).toEqual(newPayload);
    expect(result).not.toEqual(existingState);
  });
});
