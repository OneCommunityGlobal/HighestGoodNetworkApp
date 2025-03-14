import { projectByIdReducer } from '../projectByIdReducer';
import { GET_PROJECT_BY_ID } from '../../constants/project';

describe('projectByIdReducer', () => {

  it('should return the initial state if no action is provided', () => {
    const initialState = null;
    const action = { type: 'UNKNOWN_ACTION' };
    const state = projectByIdReducer(undefined, action);

    expect(state).toBe(initialState);
  });

  it('should handle GET_PROJECT_BY_ID action', () => {
    const projectData = {
      id: 1,
      name: 'Test Project',
      description: 'This is a test project'
    };

    const action = {
      type: GET_PROJECT_BY_ID,
      payload: projectData
    };

    const state = projectByIdReducer(null, action);

    expect(state).toEqual(projectData);
  });

  it('should update the project when a valid GET_PROJECT_BY_ID action is dispatched', () => {
    const initialState = { id: 1, name: 'Initial Project', description: 'Old description' };

    const updatedProject = {
      id: 1,
      name: 'Updated Project',
      description: 'New project description'
    };

    const action = {
      type: GET_PROJECT_BY_ID,
      payload: updatedProject
    };

    const state = projectByIdReducer(initialState, action);

    expect(state).toEqual(updatedProject);
  });

  it('should return the current state when an unknown action type is dispatched', () => {
    const currentState = {
      id: 1,
      name: 'Test Project',
      description: 'Current project description'
    };

    const action = {
      type: 'UNKNOWN_ACTION',
    };

    const state = projectByIdReducer(currentState, action);

    expect(state).toEqual(currentState);
  });

});