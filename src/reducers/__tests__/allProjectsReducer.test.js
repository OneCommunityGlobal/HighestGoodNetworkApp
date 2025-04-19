import { allProjectsReducer } from '../allProjectsReducer';
import * as types from '../../constants/projects';

describe('allProjectsReducer', () => {
  const initialState = {
    fetching: false,
    fetched: false,
    projects: [],
    status: 200,
    error: null,
  };

  it('should return the initial state when an unknown action is passed', () => {
    const newState = allProjectsReducer(undefined, {});
    expect(newState).toEqual(initialState);
  });

  it('should handle FETCH_PROJECTS_START', () => {
    const action = { type: types.FETCH_PROJECTS_START };
    const expectedState = { ...initialState, fetching: true };
    const newState = allProjectsReducer(initialState, action);
    expect(newState).toEqual(expectedState);
  });

  it('should handle FETCH_PROJECTS_ERROR', () => {
    const action = {
      type: types.FETCH_PROJECTS_ERROR,
      status: 404,
      error: 'Not Found',
    };
    const expectedState = {
      ...initialState,
      fetching: false,
      status: 404,
      error: 'Not Found',
    };
    const newState = allProjectsReducer(initialState, action);
    expect(newState).toEqual(expectedState);
  });

  it('should handle FETCH_PROJECTS_SUCCESS', () => {
    const projects = [{ _id: 1, name: 'Project 1' }, { _id: 2, name: 'Project 2' }];
    const action = {
      type: types.FETCH_PROJECTS_SUCCESS,
      projects,
      status: 200,
    };
    const expectedState = {
      ...initialState,
      fetching: false,
      fetched: true,
      projects,
      status: 200,
    };
    const newState = allProjectsReducer(initialState, action);
    expect(newState).toEqual(expectedState);
  });

  it('should handle ADD_NEW_PROJECT with successful status', () => {
    const newProject = { _id: 3, name: 'Project 3' };
    const action = {
      type: types.ADD_NEW_PROJECT,
      newProject,
      status: 201,
    };
    const expectedState = {
      ...initialState,
      projects: [...initialState.projects, newProject],
      status: 201,
    };
    const newState = allProjectsReducer(initialState, action);
    expect(newState).toEqual(expectedState);
  });

  it('should handle ADD_NEW_PROJECT with unsuccessful status', () => {
    const action = {
      type: types.ADD_NEW_PROJECT,
      newProject: { _id: 3, name: 'Project 3' },
      status: 400,
      error: 'Bad Request',
    };
    const expectedState = {
      ...initialState,
      status: 400,
      error: 'Bad Request',
    };
    const newState = allProjectsReducer(initialState, action);
    expect(newState).toEqual(expectedState);
  });

  it('should handle UPDATE_PROJECT with successful status', () => {
    const initialStateWithProjects = {
      ...initialState,
      projects: [
        { _id: 1, name: 'Project 1' },
        { _id: 2, name: 'Project 2' },
      ],
    };
    const updatedProject = { _id: 2, name: 'Updated Project 2' };
    const action = {
      type: types.UPDATE_PROJECT,
      projectId: 2,
      updatedProject,
      status: 200,
    };
    const expectedState = {
      ...initialStateWithProjects,
      projects: [
        { _id: 1, name: 'Project 1' },
        updatedProject,
      ],
      status: 200,
    };
    const newState = allProjectsReducer(initialStateWithProjects, action);
    expect(newState).toEqual(expectedState);
  });

  it('should handle DELETE_PROJECT with successful status', () => {
    const initialStateWithProjects = {
      ...initialState,
      projects: [
        { _id: 1, name: 'Project 1' },
        { _id: 2, name: 'Project 2' },
      ],
    };
    const action = {
      type: types.DELETE_PROJECT,
      projectId: 1,
      status: 200,
    };
    const expectedState = {
      ...initialStateWithProjects,
      projects: [{ _id: 2, name: 'Project 2' }],
      status: 200,
    };
    const newState = allProjectsReducer(initialStateWithProjects, action);
    expect(newState).toEqual(expectedState);
  });

  it('should handle CLEAR_ERROR', () => {
    const action = { type: types.CLEAR_ERROR };
    const currentState = { ...initialState, error: 'Some error', status: 500 };
    const expectedState = { ...currentState, error: null, status: 200 };
    const newState = allProjectsReducer(currentState, action);
    expect(newState).toEqual(expectedState);
  });
});