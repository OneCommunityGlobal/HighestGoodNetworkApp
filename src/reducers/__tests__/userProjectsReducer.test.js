import { userProjectsReducer } from '../userProjectsReducer';
import types from '../../constants/userProjects';

describe('userProjectsReducer', () => {
  const initialState = {
    projects: [],
    wbs: [],
  };

  it('should return the initial state when no action is provided', () => {
    const result = userProjectsReducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should handle GET_USER_PROJECTS action type', () => {
    const mockProjects = [
      { id: 1, name: 'Project 1' },
      { id: 2, name: 'Project 2' },
    ];

    const action = {
      type: types.GET_USER_PROJECTS,
      payload: mockProjects,
    };

    const expectedState = {
      ...initialState,
      projects: mockProjects,
    };

    const result = userProjectsReducer(initialState, action);
    expect(result).toEqual(expectedState);
  });

  it('should return the current state for unknown action types', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const result = userProjectsReducer(initialState, action);
    expect(result).toEqual(initialState);
  });

  it('should handle GET_USER_PROJECTS with empty payload', () => {
    const action = {
      type: types.GET_USER_PROJECTS,
      payload: [],
    };

    const expectedState = {
      ...initialState,
      projects: [],
    };

    const result = userProjectsReducer(initialState, action);
    expect(result).toEqual(expectedState);
  });

});
