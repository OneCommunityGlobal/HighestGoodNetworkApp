import {
  userProfileByIdReducer,
  userTaskByIdReducer,
  updateObject
} from '../userProfileByIdReducer';
import {
  GET_USER_PROFILE,
  EDIT_USER_PROFILE,
  GET_USER_TASKS
} from '../../constants/userProfile';

describe('userProfileByIdReducer', () => {
  const initialState = {
    firstName: '',
    lastName: '',
    jobTitle: '',
    isActive: '',
  };

  it('should return the initial state', () => {
    const result = userProfileByIdReducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should handle GET_USER_PROFILE', () => {
    const action = {
      type: GET_USER_PROFILE,
      payload: {
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Developer',
        isActive: true,
      },
    };
    const result = userProfileByIdReducer(initialState, action);
    expect(result).toEqual(action.payload);
  });

  it('should handle EDIT_USER_PROFILE', () => {
    const initialState = {
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'Developer',
      isActive: true,
    };
    const action = {
      type: EDIT_USER_PROFILE,
      payload: {
        jobTitle: 'Senior Developer',
      },
    };
    const expectedState = {
      ...initialState,
      jobTitle: 'Senior Developer',
    };
    const result = userProfileByIdReducer(initialState, action);
    expect(result).toEqual(expectedState);
  });

  it('should handle CLEAR_USER_PROFILE', () => {
    const action = { type: 'CLEAR_USER_PROFILE' };
    const result = userProfileByIdReducer(initialState, action);
    expect(result).toBeNull();
  });
});

describe('userTaskByIdReducer', () => {
  it('should return the initial state', () => {
    const result = userTaskByIdReducer(undefined, {});
    expect(result).toEqual([]);
  });

  it('should handle GET_USER_TASKS', () => {
    const action = {
      type: GET_USER_TASKS,
      payload: [
        { id: 1, task: 'Task 1' },
        { id: 2, task: 'Task 2' },
      ],
    };
    const result = userTaskByIdReducer([], action);
    expect(result).toEqual(action.payload);
  });
});

describe('updateObject utility function', () => {
  it('should update an object with new properties', () => {
    const oldObject = { a: 1, b: 2 };
    const updatedProperties = { b: 3, c: 4 };
    const result = updateObject(oldObject, updatedProperties);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should not mutate the original object', () => {
    const oldObject = { a: 1, b: 2 };
    const updatedProperties = { b: 3, c: 4 };
    updateObject(oldObject, updatedProperties);
    expect(oldObject).toEqual({ a: 1, b: 2 });
  });
});
