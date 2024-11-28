import { projectMembershipReducer } from '../projectMembershipReducer';
import * as types from '../../constants/projectMembership';

describe('projectMembershipReducer', () => {
  const initialState = {
    projectName: '',
    fetching: false,
    fetched: false,
    members: [],
    foundUsers: [],
    error: '',
  };

  it('should return the initial state', () => {
    expect(projectMembershipReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_MEMBERS_START', () => {
    const action = { type: types.FETCH_MEMBERS_START };
    const expectedState = { ...initialState, fetching: true, fetched: false, error: 'none' };
    expect(projectMembershipReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_MEMBERS_ERROR', () => {
    const action = { type: types.FETCH_MEMBERS_ERROR, err: 'Error fetching members' };
    const expectedState = { ...initialState, fetching: false, fetched: true, error: action.err };
    expect(projectMembershipReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle RECEIVE_MEMBERS', () => {
    const members = [{ _id: '1', name: 'John Doe' }];
    const action = { type: types.RECEIVE_MEMBERS, members };
    const expectedState = {
      ...initialState,
      members,
      fetching: false,
      fetched: true,
      error: 'none',
    };
    expect(projectMembershipReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FIND_USERS_START', () => {
    const action = { type: types.FIND_USERS_START };
    const expectedState = { ...initialState, fetching: true, fetched: false, error: 'none' };
    expect(projectMembershipReducer(initialState, action)).toEqual(expectedState);
  });
});
