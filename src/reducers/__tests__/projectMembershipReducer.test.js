import { projectMembershipReducer } from '../projectMembershipReducer';
import * as types from '../../constants/projectMembership';

describe('projectMembershipReducer', () => {
  const initialState = {
    projectName: '',
    fetching: false,
    fetched: false,
    members: [],
    activeMemberCounts: {},
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

  it('should handle FIND_USERS_ERROR', () => {
    const action = { type: types.FIND_USERS_ERROR, err: 'Error finding users' };
    const expectedState = { ...initialState, fetching: false, fetched: true, error: action.err };
    expect(projectMembershipReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FOUND_USERS', () => {
    const users = [{ _id: '2', name: 'Jane Smith' }];
    const action = { type: types.FOUND_USERS, users };
    const expectedState = {
      ...initialState,
      foundUsers: users,
      fetching: false,
      fetched: true,
      error: 'none',
    };
    expect(projectMembershipReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_NEW_MEMBER', () => {
    const member = { _id: '3', name: 'New Member' };
    const action = { type: types.ADD_NEW_MEMBER, member };
    const expectedState = {
      ...initialState,
      members: [member, ...initialState.members],
    };
    expect(projectMembershipReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle DELETE_MEMBER', () => {
    const initialStateWithMembers = {
      ...initialState,
      members: [{ _id: '4', name: 'Existing Member' }],
    };
    const action = { type: types.DELETE_MEMBER, userId: '4' };
    const expectedState = { ...initialStateWithMembers, members: [] };
    expect(projectMembershipReducer(initialStateWithMembers, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_FOUND_USER', () => {
    const initialStateWithFoundUsers = {
      ...initialState,
      foundUsers: [{ _id: '5', name: 'Found User' }],
    };
    const action = { type: types.REMOVE_FOUND_USER, userId: '5' };
    const expectedState = { ...initialStateWithFoundUsers, foundUsers: [] };
    expect(projectMembershipReducer(initialStateWithFoundUsers, action)).toEqual(expectedState);
  });
});
